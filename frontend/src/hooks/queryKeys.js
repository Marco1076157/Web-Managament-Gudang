/**
 * Cache key terpusat untuk React Query (pattern Stale-While-Revalidate).
 *
 * Semua key berbentuk array sehingga bisa di-invalidate per prefix:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.transactions })
 *   -> semua list transaksi + summary ikut di-refetch di background.
 *
 * Key untuk transaksi harus tetap sama dengan `useDashboardData.js`
 * (ringkasan dashboard) supaya invalidasi checkout ikut meng-clear
 * stat cards di halaman Overview.
 */
export const queryKeys = {
  merchant: ['merchant'],
  myMerchant: ['merchant', 'my'],

  products: ['products'],
  productList: (params = {}) => ['products', 'list', params],

  categories: ['categories'],
  categoryList: (params = {}) => ['categories', 'list', params],

  transactions: ['transactions'],
  transactionList: (params = {}) => ['transactions', 'list', params],
  transactionSummary: ['transactions', 'summary'],

  roles: ['roles'],
  roleList: (params = {}) => ['roles', 'list', params],

  users: ['users'],
  userList: (params = {}) => ['users', 'list', params],
}
