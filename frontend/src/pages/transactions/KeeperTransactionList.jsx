import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Phone,
  User,
  Plus,
  ReceiptText,
  Loader2,
} from 'lucide-react'
import {
  useMyMerchant,
  useMyMerchantTransactions,
} from '../../hooks/useCachedData'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Badge from '../../components/Badge'
import Table from '../../components/Table'
import SafeImage from '../../components/SafeImage'

const KeeperTransactionList = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  // Ganti filter selalu kembali ke halaman pertama (reset dilakukan di
  // handler onChange tiap control, bukan di dalam useEffect).

  // Toko & transaksi memakai cache SWR: buka menu ini lagi setelah pindah
  // halaman -> langsung tampil dari cache, revalidasi jalan di background.
  const merchantQuery = useMyMerchant()
  const merchant = merchantQuery.data ?? null

  const params = useMemo(() => ({
    page,
    per_page: perPage,
    sort: '-created_at',
    ...(search ? { search } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
  }), [page, search, statusFilter, dateFrom, dateTo])

  const transactionsQuery = useMyMerchantTransactions(params, Boolean(merchant))
  const { items: transactions = [], total = 0, totalPages = 1 } =
    transactionsQuery.data ?? {}

  // Skeleton hanya saat belum ada data sama sekali; ganti filter/pagination
  // memakai data lama dulu (keepPreviousData) tanpa layar kosong.
  const showSkeleton =
    merchantQuery.isPending || (Boolean(merchant) && transactionsQuery.isPending)
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
  ]

  if (showSkeleton) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-100 rounded w-1/4" />
            <div className="h-4 bg-slate-100 rounded w-1/4" />
          </div>
          <div className="h-10 w-28 bg-slate-200 rounded-full" />
        </div>
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!showSkeleton && !merchant) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-12 text-center">
        <ReceiptText className="w-16 h-16 mx-auto text-slate-400 mb-4" aria-hidden="true" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Belum ditugaskan ke merchant</h2>
        <p className="text-slate-500">Silakan hubungi admin untuk mendapatkan akses ke toko</p>
      </div>
    )
  }

  const keeperName = merchant?.keeper?.name || user?.name || '-'

  return (
    <div className="space-y-6">
      <h1 className="sr-only">Manage Transactions</h1>

      {/* Banner info merchant + tombol Add New ( wizard transaksi 3-step ) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 ring-1 ring-slate-200 overflow-hidden shrink-0">
            <SafeImage
              src={merchant?.photo}
              alt={`Foto ${merchant?.name || 'toko'}`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-slate-900 truncate">{merchant?.name}</p>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
              {merchant?.phone || '-'}
            </p>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
              Keeper: <span className="font-semibold text-slate-800">{keeperName}</span>
              <span className="text-slate-400">(You)</span>
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/transactions/create')}
            className="self-start sm:self-center shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add New
          </Button>
        </div>
      </div>

      {/* Sub-header jumlah transaksi */}
      <div>
        <p className="text-xl font-bold text-slate-900">{total} Total Transactions</p>
        <p className="text-sm text-slate-500 mt-1">
          View and update your transactions list here.
        </p>
      </div>

      {/* All Transactions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
          <ReceiptText className="w-5 h-5 text-blue-600" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-900">All Transactions</h2>
          {refreshing && (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin ml-auto" aria-label="Memperbarui" />
          )}
        </div>

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

export default KeeperTransactionList
