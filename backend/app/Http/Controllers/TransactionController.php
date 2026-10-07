<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\User;
use App\Services\TransactionService;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    private TransactionService $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function index(Request $request)
    {
        $filters = $request->only([
            'search',
            'status',
            'merchant_id',
            'date_from',
            'date_to',
            'per_page',
        ]);

        // Keeper hanya boleh melihat transaksi toko yang ditugaskan kepadanya.
        // merchant_id kiriman client sengaja ditimpa agar tidak bisa dibobol.
        $scopedMerchantId = $this->accessibleMerchantId($request->user());

        if ($scopedMerchantId === 0) {
            return $this->emptyList('Transactions retrieved successfully');
        }

        if ($scopedMerchantId !== null) {
            $filters['merchant_id'] = $scopedMerchantId;
        }

        $transactions = $this->transactionService->getAll([], $filters);

        return response()->json([
            'success' => true,
            'message' => 'Transactions retrieved successfully',
            'data' => TransactionResource::collection($transactions),
            'meta' => [
                'total' => $transactions->total(),
                'per_page' => $transactions->perPage(),
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
            ],
        ]);
    }

    public function store(TransactionRequest $request)
    {
        $transaction = $this->transactionService->createTransaction($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Transaction recorded successfully',
            'data' => new TransactionResource($transaction),
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        $transaction = $this->transactionService->getById($id, []);

        // Keeper tidak boleh mengintip transaksi toko lain.
        if ($this->isKeeperOutsideScope($request->user(), (int) $transaction->merchant_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke transaksi ini.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Transaction retrieved successfully',
            'data' => new TransactionResource($transaction),
        ]);
    }

    public function getTransactionsByMerchant(Request $request)
    {
        $merchant = $request->user()->merchants;

        if (! $merchant) {
            return response()->json([
                'success' => false,
                'message' => 'Merchant not found for this user.',
            ], 404);
        }

        $filters = $request->only([
            'search',
            'status',
            'date_from',
            'date_to',
            'per_page',
        ]);

        $transactions = $this->transactionService->getByMerchantId($merchant->id, [], $filters);

        return response()->json([
            'success' => true,
            'message' => 'Merchant transactions retrieved successfully',
            'data' => TransactionResource::collection($transactions),
            'meta' => [
                'total' => $transactions->total(),
                'per_page' => $transactions->perPage(),
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
            ],
        ]);
    }

    /**
     * Aggregate untuk Stat Cards dashboard.
     * Dipisah dari /transactions supaya dashboard tidak perlu
     * menarik seluruh baris transaksi hanya untuk menjumlahkannya.
     */
    public function summary(Request $request)
    {
        $merchantId = $this->accessibleMerchantId($request->user());

        // Keeper yang belum ditugaskan ke toko mana pun: angka nol,
        // bukan agregat seluruh transaksi milik toko lain.
        if ($merchantId === 0) {
            return response()->json([
                'success' => true,
                'message' => 'Dashboard summary retrieved successfully',
                'data' => [
                    'totalRevenue' => 0,
                    'totalTransactions' => 0,
                    'productsSold' => 0,
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Dashboard summary retrieved successfully',
            'data' => $this->transactionService->getDashboardSummary($merchantId),
        ]);
    }

    /**
     * Id merchant yang boleh dibaca oleh user ini.
     *
     * @return int|null null = tanpa pembatasan (manager),
     *                  0   = keeper tanpa toko (harus dapat hasil kosong),
     *                  >0  = id toko milik keeper
     */
    private function accessibleMerchantId(?User $user): ?int
    {
        if (! $user || ! $user->hasRole('keeper')) {
            return null;
        }

        return (int) ($user->merchants?->id ?? 0);
    }

    private function isKeeperOutsideScope(?User $user, int $merchantId): bool
    {
        $scopedMerchantId = $this->accessibleMerchantId($user);

        if ($scopedMerchantId === null) {
            return false;
        }

        return $scopedMerchantId === 0 || $scopedMerchantId !== $merchantId;
    }

    /**
     * @param  array<string, mixed>  $meta
     */
    private function emptyList(string $message, array $meta = [])
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [],
            'meta' => array_merge([
                'total' => 0,
                'per_page' => 10,
                'current_page' => 1,
                'last_page' => 1,
            ], $meta),
        ]);
    }
}
