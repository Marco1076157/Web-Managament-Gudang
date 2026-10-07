import { useQuery } from '@tanstack/react-query'
import { transactionService } from '../api'
import { queryKeys } from './queryKeys'
import { swrOptions } from './useCachedData'

/**
 * Key harus konsisten & array-based supaya granular per-parameter.
 * Di-delegasikan ke `queryKeys` supaya invalidasi checkout (POS) ikut
 * me-refresh ringkasan dashboard.
 */
export const transactionKeys = {
  all: queryKeys.transactions,
  lists: () => [...queryKeys.transactions, 'list'],
  list: (params) => queryKeys.transactionList(params),
  summary: () => queryKeys.transactionSummary,
}

/**
 * Aggregate dashboard: revenue, jumlah transaksi, produk terjual.
 * Dipisah dari list supaya tidak perlu menarik semua baris transaksi.
 */
export const useTransactionSummary = () =>
  useQuery({
    queryKey: transactionKeys.summary(),
    ...swrOptions,
    queryFn: async () => {
      const res = await transactionService.getSummary()
      return {
        totalRevenue: res?.data?.totalRevenue ?? 0,
        totalTransactions: res?.data?.totalTransactions ?? 0,
        productsSold: res?.data?.productsSold ?? 0,
      }
    },
  })

/**
 * Daftar transaksi terbaru untuk card list di dashboard.
 * `per_page` sengaja kecil supaya payload ringkas.
 */
export const useRecentTransactions = (perPage = 5) =>
  useQuery({
    queryKey: transactionKeys.list({ per_page: perPage, sort: '-created_at' }),
    ...swrOptions,
    queryFn: async () => {
      const res = await transactionService.getAll({
        per_page: perPage,
        sort: '-created_at',
      })
      return {
        items: res?.data ?? [],
        total: res?.meta?.total ?? 0,
      }
    },
  })