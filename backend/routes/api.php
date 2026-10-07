<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MerchantController;
use App\Http\Controllers\MerchantProductController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserRoleController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\WarehouseProductController;
use Illuminate\Support\Facades\Route;

Route::post('token-login', [AuthController::class, 'tokenLogin']);
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [AuthController::class, 'user']);
    Route::post('logout', [AuthController::class, 'logout']);
});

Route::middleware(['auth:sanctum', 'role:manager'])->group(function () {

    Route::apiResource('users', UserController::class);
    Route::apiResource('roles', RoleController::class);

    // Endpoint lama (body: user_id + role_id) - tetap dipakai agar backward compatible.
    Route::post('users/roles', [UserRoleController::class, 'assignRole']);

    // Endpoint RESTful untuk halaman Assign Role. WAJIB didaftarkan sebelum
    // apiResource('users') tidak wajib karena {user} tidak akan cocok dengan
    // "2/role" (tidak ada slash), tapi tetap ditaruh di sini agar jelas.
    Route::put('users/{user}/role', [UserRoleController::class, 'assignRole']);

    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('products', ProductController::class);

    Route::apiResource('warehouses', WarehouseController::class);
    Route::apiResource('merchants', MerchantController::class);

    // Daftar produk + stok di dalam gudang / merchant (Manager).
    // Dideklarasikan eksplisit (getProducts), di luar apiResource di atas.
    Route::get('warehouses/{warehouse}/products', [WarehouseController::class, 'products']);
    Route::get('merchants/{merchant}/products', [MerchantController::class, 'products']);

    Route::post('warehouses/{warehouse}/products', [WarehouseProductController::class, 'attach']);
    Route::delete('warehouses/{warehouse}/products/{product}', [WarehouseProductController::class, 'detach']);
    Route::put('warehouses/{warehouse}/products/{product}', [WarehouseProductController::class, 'update']);

    Route::post('merchants/{merchant}/products', [MerchantProductController::class, 'store']);
    Route::delete('merchants/{merchant}/products/{product}', [MerchantProductController::class, 'destroy']);
    Route::put('merchants/{merchant}/products/{product}', [MerchantProductController::class, 'update']);

});

// Grup baca bersama manager & keeper.
// Transaksi sebelumnya hanya di grup `role:manager`, sehingga Keeper selalu
// mendapat 403 pada /transactions dan /transactions/summary (dashboard error).
// Scope data keeper (hanya toko miliknya) diterapkan di TransactionController.
Route::middleware(['auth:sanctum', 'role:manager|keeper'])->group(function () {

    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{category}', [CategoryController::class, 'show']);

    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{product}', [ProductController::class, 'show']);

    Route::get('warehouses', [WarehouseController::class, 'index']);
    Route::get('warehouses/{warehouse}', [WarehouseController::class, 'show']);

    // WAJIB didaftarkan SEBELUM apiResource('transactions'),
    // jika tidak 'summary' akan tertangkap oleh transactions/{transaction}.
    Route::get('transactions/summary', [TransactionController::class, 'summary']);

    // update/destroy tidak dimiliki TransactionController, sengaja dikecualikan.
    Route::apiResource('transactions', TransactionController::class)
        ->except(['update', 'destroy']);

    Route::get('my-merchant', [MerchantController::class, 'getMyMerchantProfile']);
    Route::get('/my-merchant/transactions', [TransactionController::class, 'getTransactionsByMerchant']);

});
