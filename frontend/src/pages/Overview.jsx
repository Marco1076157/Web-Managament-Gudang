import {
  DollarSign,
  ReceiptText,
  Package,
  ArrowUpRight,
  User,
  Store,
  Tag,
  Phone,
  FileText,
  Loader2,
} from 'lucide-react'
import { useTransactionSummary, useRecentTransactions } from '../hooks/useDashboardData'

const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount || 0)

const statusMeta = {
  success: { label: 'Success', className: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
}

/* ---------------------------- Skeletons ---------------------------- */

const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
    <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse mb-4" />
    <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mb-3" />
    <div className="h-7 w-32 bg-slate-200 rounded animate-pulse" />
  </div>
)

const TransactionCardSkeleton = () => (
  <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-1/4 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
    </div>
    <div className="h-3 w-2/3 bg-slate-100 rounded animate-pulse" />
    <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
  </div>
)

/* ---------------------------- Sub Components ---------------------------- */

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 hover:shadow-2xl hover:border-blue-200 transition-all">
    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
      <Icon className="w-5 h-5 text-blue-600" aria-hidden="true" />
    </div>
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
)

const TransactionCard = ({ tx }) => {
  const status = statusMeta[tx.status] || statusMeta.pending
  const items = tx.items || []

  return (
    <article className="border border-slate-200 rounded-2xl p-4 hover:border-blue-300 hover:shadow-md transition-all">
      {/* Customer + status */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">
            {tx.customer_name?.charAt(0).toUpperCase() || '?'}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {tx.customer_name || '-'}
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Phone className="w-3 h-3 shrink-0" aria-hidden="true" />
            {tx.customer_phone || 'No. HP belum diisi'}
          </p>
        </div>

        <span
          className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {/* Merchant */}
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-600">
        <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
        <span className="truncate">{tx.merchant?.name || '-'}</span>
        <span className="text-slate-300">|</span>
        <span className="truncate font-mono text-slate-400">{tx.transaction_code}</span>
      </div>

      {/* Product Assigned */}
      <div className="mt-3 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Product Assigned
        </p>

        {items.length === 0 ? (
          <p className="text-xs text-slate-400">Tidak ada produk</p>
        ) : (
          items.map((item, i) => (
            <div
              key={item.id ?? i}
              className="flex items-center justify-between gap-2 bg-slate-50 rounded-xl px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">
                  {item.product?.name || '-'}
                </p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Tag className="w-3 h-3" aria-hidden="true" />
                  {item.product?.category?.name || 'Uncategorized'}
                  <span className="text-slate-300">|</span>
                  {item.qty} x {formatCurrency(item.price)}
                </p>
              </div>
              <p className="text-xs font-semibold text-slate-800 shrink-0">
                {formatCurrency(item.subtotal)}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Grandtotal */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-500">Grandtotal</span>
        <span className="text-sm font-bold text-blue-600">
          {formatCurrency(tx.total_amount)}
        </span>
      </div>
    </article>
  )
}

const EmptyState = () => (
  <div className="border-2 border-dashed border-slate-200 rounded-2xl py-12 px-6 text-center">
    <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
      <FileText className="w-8 h-8 text-slate-300" aria-hidden="true" />
    </div>
    <p className="text-sm font-medium text-slate-500">
      Oops, it looks like there's no data yet.
    </p>
  </div>
)

/* ---------------------------- Page ---------------------------- */

const Overview = () => {
  const summaryQuery = useTransactionSummary()
  const recentQuery = useRecentTransactions(5)

  const isInitialLoading = (summaryQuery.isPending || recentQuery.isPending) && !summaryQuery.data
  const isRefreshing = summaryQuery.isFetching || recentQuery.isFetching
  const error = summaryQuery.error || recentQuery.error

  const summary = summaryQuery.data || {
    totalRevenue: 0,
    totalTransactions: 0,
    productsSold: 0,
  }
  const transactions = recentQuery.data?.items || []

  const stats = [
    {
      key: 'revenue',
      label: 'Total Revenue',
      value: formatCurrency(summary.totalRevenue),
      icon: DollarSign,
    },
    {
      key: 'transactions',
      label: 'Total Transactions',
      value: (summary.totalTransactions || 0).toLocaleString('id-ID'),
      icon: ReceiptText,
    },
    {
      key: 'sold',
      label: 'Products Sold',
      value: (summary.productsSold || 0).toLocaleString('id-ID'),
      icon: Package,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        {isRefreshing && (
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" aria-label="Memuat" />
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium">
          Gagal memuat data dashboard.
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isInitialLoading
          ? [1, 2, 3].map((i) => <StatCardSkeleton key={i} />)
          : stats.map(({ key, ...s }) => <StatCard key={key} {...s} />)}
      </div>

      {/* Latest Transaction (satu kolom penuh sesuai referensi) */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xl">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <h2 className="text-base font-bold text-slate-900">Latest Transaction</h2>
          </div>
          {recentQuery.data?.total > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              {recentQuery.data.total} total
            </span>
          )}
        </div>

        <div className="p-6">
          {recentQuery.isPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <TransactionCardSkeleton key={i} />)}
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {transactions.map((tx) => (
                <TransactionCard key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Overview