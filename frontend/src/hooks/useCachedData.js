import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  categoryService,
  merchantService,
  productService,
  roleService,
  transactionService,
  userService,
} from '../api'
import { queryKeys } from './queryKeys'

/**
 * Opsi default Stale-While-Revalidate untuk data referensi/list.
 *
 * - `staleTime` 5 menit: data masih dianggap segar, jadi pindah menu
 *   (Overview / Transactions / My Merchant / Settings) langsung dirender
 *   dari cache tanpa menunggu request jaringan (0 detik).
 * - `placeholderData: keepPreviousData`: saat key berubah (ganti halaman,
 *   ganti filter), data lama tetap tampil dulu sehingga tidak ada
 *   full-page skeleton loader yang berkedip, hanya indikator refresh kecil.
 */
export const swrOptions = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  placeholderData: keepPreviousData,
}

/** Respons list standar backend -> bentuk yang siap dipakai tabel. */
const normalizeList = (response) => {
  const items = response?.data ?? []
  const meta = response?.meta ?? {}

  return {
    items,
    total: meta.total ?? items.length,
    totalPages: meta.last_page ?? 1,
    currentPage: meta.current_page ?? 1,
  }
}

/* ------------------------------- Merchant ------------------------------- */

/**
 * Merchant milik keeper yang sedang login (`GET /my-merchant`).
 * Keeper tanpa toko mendapat `null` (bukan error) supaya halaman bisa
 * menampilkan empty-state "Belum ditugaskan ke merchant".
 */
export const useMyMerchant = () =>
  useQuery({
    queryKey: queryKeys.myMerchant,
    queryFn: async () => {
      try {
        return await merchantService.getMyMerchant()
      } catch (error) {
        if (error.response?.status === 404) return null
        throw error
      }
    },
    ...swrOptions,
    // 404 sudah ditangani di queryFn, tidak perlu retry.
    retry: false,
  })

/* ------------------------------- Produk --------------------------------- */

/**
 * Produk milik satu merchant (dipakai halaman My Merchant & wizard POS).
 * `merchantId` masih kosong saat query pertama jalan -> didisable dulu
 * agar tidak memanggil API dengan parameter kosong.
 */
export const useMerchantProducts = (merchantId) =>
  useQuery({
    queryKey: queryKeys.productList({ merchant_id: merchantId, per_page: 100 }),
    enabled: Boolean(merchantId),
    queryFn: async () => normalizeList(
      await productService.getAll({ merchant_id: merchantId, per_page: 100 })
    ),
    ...swrOptions,
  })

/** Daftar produk untuk halaman manager (filter + pagination). */
export const useProducts = (params) =>
  useQuery({
    queryKey: queryKeys.productList(params),
    queryFn: async () => normalizeList(await productService.getAll(params)),
    ...swrOptions,
  })

/** Opsi kategori untuk dropdown filter (jarang berubah -> staleTime lama). */
export const useCategoryOptions = (perPage = 100) =>
  useQuery({
    queryKey: queryKeys.categoryList({ per_page: perPage, purpose: 'options' }),
    queryFn: async () => {
      const response = await categoryService.getAll({ per_page: perPage })
      return response?.data ?? []
    },
    ...swrOptions,
    staleTime: 10 * 60 * 1000,
  })

/* ----------------------------- Transaksi -------------------------------- */

/** Transaksi milik merchant keeper (`GET /my-merchant/transactions`). */
export const useMyMerchantTransactions = (params, enabled = true) =>
  useQuery({
    queryKey: queryKeys.transactionList({ scope: 'my-merchant', ...params }),
    enabled,
    queryFn: async () => normalizeList(
      await transactionService.getMerchantTransactions(params)
    ),
    ...swrOptions,
  })

/** Transaksi seluruh merchant (`GET /transactions`, khusus manager). */
export const useAllTransactions = (params) =>
  useQuery({
    queryKey: queryKeys.transactionList({ scope: 'all', ...params }),
    queryFn: async () => normalizeList(await transactionService.getAll(params)),
    ...swrOptions,
  })

/* ---------------------------- Role & User ------------------------------- */

/** Daftar role dengan pencarian + pagination (halaman Role & Permission). */
export const useRoles = (params) =>
  useQuery({
    queryKey: queryKeys.roleList(params),
    queryFn: async () => normalizeList(await roleService.getAll(params)),
    ...swrOptions,
  })

/** Opsi role untuk dropdown (form tambah/edit user & assign role). */
export const useRoleOptions = (perPage = 100) =>
  useQuery({
    queryKey: queryKeys.roleList({ per_page: perPage, purpose: 'options' }),
    queryFn: async () => {
      const response = await roleService.getAll({ per_page: perPage })
      return response?.data ?? []
    },
    ...swrOptions,
    staleTime: 10 * 60 * 1000,
  })

/** Daftar user dengan pencarian + filter role (halaman User). */
export const useUsers = (params) =>
  useQuery({
    queryKey: queryKeys.userList(params),
    queryFn: async () => normalizeList(await userService.getAll(params)),
    ...swrOptions,
  })
