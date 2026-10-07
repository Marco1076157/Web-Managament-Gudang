<?php

namespace App\Services;

use App\Events\TransactionCreated;
use App\Models\MerchantProduct;
use App\Models\Product;
use App\Models\Transaction;
use App\Repositories\Contracts\MerchantRepositoryInterface;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionService
{
    /** Besaran PPN yang dibebankan ke konsumen (10%). */
    private const TAX_RATE = 0.10;

    private TransactionRepositoryInterface $transactionRepository;

    private MerchantRepositoryInterface $merchantRepository;

    private StockAlertService $stockAlertService;

    public function __construct(
        TransactionRepositoryInterface $transactionRepository,
        MerchantRepositoryInterface $merchantRepository,
        StockAlertService $stockAlertService
    ) {
        $this->transactionRepository = $transactionRepository;
        $this->merchantRepository = $merchantRepository;
        $this->stockAlertService = $stockAlertService;
    }

    public function getAll(array $fields, array $filters = [])
    {
        return $this->transactionRepository->getAll($fields, $filters);
    }

    public function getById(int $id, array $fields)
    {
        return $this->transactionRepository->getById($id, $fields);
    }

    public function getByMerchantId(int $merchantId, array $fields, array $filters = [])
    {
        return $this->transactionRepository->getByMerchantId($merchantId, $fields, $filters);
    }

    public function getDashboardSummary(?int $merchantId = null): array
    {
        return $this->transactionRepository->getDashboardSummary($merchantId);
    }

    public function createTransaction(array $data): Transaction
    {
        return DB::transaction(function () use ($data) {
            // Keamanan: Keeper hanya boleh menjual di merchant yang ditugaskan
            // kepadanya. Manager (super admin) boleh membuat transaksi apa pun.
            $user = auth()->user();
            if ($user && $user->hasRole('keeper')) {
                $ownedMerchantId = (int) ($user->merchants?->id ?? 0);
                if ($ownedMerchantId !== (int) $data['merchant_id']) {
                    throw ValidationException::withMessages([
                        'merchant_id' => ['Anda hanya dapat bertransaksi untuk merchant yang ditugaskan kepada Anda.'],
                    ]);
                }
            }

            $items = $data['items'];
            $merchantId = $data['merchant_id'];

            $totalAmount = 0;

            foreach ($items as $item) {
                $productId = $item['product_id'];
                $qty = $item['qty'];

                $merchant = $this->merchantRepository->checkStock($merchantId, $productId);

                if (! $merchant) {
                    throw ValidationException::withMessages([
                        'items' => ["Product ID {$productId} not available or out of stock."],
                    ]);
                }

                $merchantProduct = MerchantProduct::where('merchant_id', $merchantId)
                    ->where('product_id', $productId)
                    ->firstOrFail();

                if ($merchantProduct->stock < $qty) {
                    throw ValidationException::withMessages([
                        'items' => ["Insufficient stock for product ID {$productId}. Available: {$merchantProduct->stock}"],
                    ]);
                }

                $price = $merchantProduct->product->price;
                $subtotal = $price * $qty;
                $totalAmount += $subtotal;
            }

            $transactionCode = 'TRX-'.now()->format('YmdHis').'-'.rand(1000, 9999);

            // Grand total = subtotal + PPN 10%.
            $taxAmount = (int) round($totalAmount * self::TAX_RATE);
            $grandTotal = $totalAmount + $taxAmount;

            $transaction = $this->transactionRepository->create([
                'transaction_code' => $transactionCode,
                'merchant_id' => $merchantId,
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'] ?? null,
                'total_amount' => $grandTotal,
                'tax_amount' => $taxAmount,
                'status' => 'success',
            ]);

            foreach ($items as $item) {
                $productId = $item['product_id'];
                $qty = $item['qty'];

                $merchantProduct = MerchantProduct::where('merchant_id', $merchantId)
                    ->where('product_id', $productId)
                    ->firstOrFail();

                $price = $merchantProduct->product->price;
                $subtotal = $price * $qty;

                $this->transactionRepository->createDetail([
                    'transaction_id' => $transaction->id,
                    'product_id' => $productId,
                    'quantity' => $qty,
                    'price' => $price,
                    'sub_total' => $subtotal,
                ]);

                $this->merchantRepository->decrementStock($merchantId, $productId, $qty);
            }

            $transaction = $transaction->load(['merchant', 'transactionProducts.product']);

            broadcast(new TransactionCreated($transaction));

            foreach ($items as $item) {
                $product = Product::with('category')->find($item['product_id']);
                if ($product) {
                    $currentStock = MerchantProduct::where('merchant_id', $merchantId)
                        ->where('product_id', $product->id)
                        ->value('stock') ?? 0;
                    $this->stockAlertService->checkAndBroadcast(
                        $product,
                        'merchant',
                        $merchantId,
                        $transaction->merchant?->name ?? (string) $merchantId,
                        (int) $currentStock
                    );
                }
            }

            return $transaction;
        });
    }
}
