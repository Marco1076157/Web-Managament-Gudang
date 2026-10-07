import { useMemo, useState } from 'react'
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react'
import { useAllTransactions } from '../../hooks/useCachedData'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Badge from '../../components/Badge'
import Table from '../../components/Table'

const TransactionList = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  // Cache SWR: daftar transaksi dirender dari cache saat halaman dibuka
  // ulang; ganti filter/pagination tetap menampilkan data lama dulu.
  // Ganti filter juga me-reset halaman ke 1 langsung dari onChange control.
  const params = useMemo(() => ({
    page,
    per_page: perPage,
    sort: '-created_at',
    ...(search ? { search } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
  }), [page, search, statusFilter, dateFrom, dateTo])

  const transactionsQuery = useAllTransactions(params)
  const { items: transactions = [], total = 0, totalPages = 1 } =
    transactionsQuery.data ?? {}
  const loading = transactionsQuery.isPending
  const refreshing = transactionsQuery.isFetching && !transactionsQuery.isPending

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const columns = [
    { key: 'transaction_code', header: 'Kode Transaksi', sortable: true },
    { key: 'merchant.name', header: 'Merchant', render: (_, row) => row.merchant?.name || '-' },
    { key: 'customer_name', header: 'Customer' },
    { key: 'customer_phone', header: 'Telepon' },
    { key: 'tax_amount', header: 'PPN', align: 'text-right', render: (val) => formatCurrency(val || 0) },
    { key: 'total_amount', header: 'Total', align: 'text-right', sortable: true, render: (val) => formatCurrency(val) },
    { key: 'status', header: 'Status', align: 'text-center', render: (val) => (
      <Badge variant={val === 'success' ? 'success' : val === 'pending' ? 'warning' : 'danger'}>
        {val === 'success' ? 'Selesai' : val === 'pending' ? 'Pending' : 'Gagal'}
      </Badge>
    )},
    { key: 'created_at', header: 'Tanggal', sortable: true, render: (val) => formatDate(val) },
    { key: 'actions', header: 'Aksi', align: 'text-center', render: (_, row) => (
      <Button variant="ghost" size="sm" className="p-2" onClick={() => viewTransaction(row.id)}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </Button>
    )},
  ]

  const viewTransaction = (id) => {
    alert(`Detail transaksi ${id} - Coming soon`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transaksi</h1>
          <p className="text-slate-500 mt-1">Riwayat semua transaksi sistem</p>
        </div>
        {refreshing && (
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" aria-label="Memperbarui" />
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl">
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                placeholder="Cari transaksi..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-40">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="w-full bg-slate-200 border-none rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
              >
                <option value="">Semua Status</option>
                  <option value="success">Selesai</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Gagal</option>
              </select>
            </div>
            <div className="w-full sm:w-40">
              <Input
                label="Dari Tanggal"
                name="date_from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPage(1)
                }}
                leftIcon={<Calendar className="w-5 h-5" />}
              />
            </div>
            <div className="w-full sm:w-40">
              <Input
                label="Sampai Tanggal"
                name="date_to"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPage(1)
                }}
                leftIcon={<Calendar className="w-5 h-5" />}
              />
            </div>
          </div>
        </div>

        <Table
          columns={columns}
          data={transactions}
          keyField="id"
          loading={loading}
          pagination={true}
          pageSize={perPage}
          emptyMessage="Belum ada transaksi"
        />

        {totalPages > 1 && (
          <div className="px-4 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Menampilkan {((page - 1) * perPage) + 1} - {Math.min(page * perPage, total)} dari {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1 || transactionsQuery.isFetching}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-700 w-20 text-center">
                Halaman {page} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages || transactionsQuery.isFetching}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionList