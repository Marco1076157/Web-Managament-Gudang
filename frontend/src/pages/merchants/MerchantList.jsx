import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  User,
  PackagePlus,
} from 'lucide-react'
import { merchantService } from '../../api'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Table from '../../components/Table'
import SafeImage from '../../components/SafeImage'
import Badge from '../../components/Badge'
import MerchantProductsModal from '../../components/MerchantProductsModal'

/**
 * Daftar merchant.
 * - Tombol "Tambah Merchant" -&gt; ke /merchants/add (BUKAN modal).
 * - Fitur Hapus tidak ditampilkan (menunggu permintaan client).
 * - Kolom mengikuti MerchantResource: name, address, phone, photo, keeper.
 */
const MerchantList = () => {
  const navigate = useNavigate()
  const [merchants, setMerchants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [stockMerchant, setStockMerchant] = useState(null)
  const perPage = 10

  const fetchMerchants = async (page = 1) => {
    try {
      setLoading(true)
      const params = { page, per_page: perPage }
      if (search) params.search = search

      const response = await merchantService.getAll(params)
      setMerchants(response.data || [])
      setTotalPages(response.meta?.last_page || 1)
      setTotal(response.meta?.total || 0)
      setCurrentPage(response.meta?.current_page || 1)
    } catch (error) {
      console.error('Fetch merchants error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMerchants(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const columns = [
    {
      key: 'photo',
      header: 'Foto',
      align: 'text-center',
      render: (val, row) => (
        <SafeImage
          src={val}
          alt={row.name}
          className="w-12 h-12 rounded-lg object-cover mx-auto"
        />
      ),
    },
    { key: 'name', header: 'Nama Merchant', sortable: true },
    {
      key: 'address',
      header: 'Alamat',
      render: (val) => (
        <span className="inline-flex items-start gap-1.5 min-w-0">
          <MapPin
            className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <span className="truncate">{val || '-'}</span>
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Telepon',
      render: (val) => (
        <span className="inline-flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-slate-400" aria-hidden="true" />
          {val || '-'}
        </span>
      ),
    },
    {
      key: 'keeper',
      header: 'Keeper',
      render: (_, row) =>
        row.keeper ? (
          <span className="inline-flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <span className="truncate">{row.keeper.name}</span>
          </span>
        ) : (
          '-'
        ),
    },
    {
      key: 'products_count',
      header: 'Produk',
      align: 'text-center',
      render: (val) => (
        <Badge variant={val > 0 ? 'info' : 'default'}>
          {val ?? 0} produk
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'text-center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-blue-600 hover:bg-blue-50"
            onClick={() => setStockMerchant(row)}
            aria-label={`Distribusi stok ${row.name}`}
          >
            <PackagePlus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/merchants/edit/${row.id}`)}
            className="p-2"
            aria-label={`Edit ${row.name}`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Merchant</h1>
          <p className="text-slate-500 mt-1">Kelola titik penjualan</p>
        </div>
        <Button onClick={() => navigate('/merchants/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Merchant
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl">
        <div className="p-4 border-b border-slate-200">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none"
              aria-hidden="true"
            />
            <Input
              placeholder="Cari merchant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={merchants}
          keyField="id"
          loading={loading}
          pagination={false}
          pageSize={perPage}
          emptyMessage="Belum ada merchant"
        />

        {totalPages > 1 && (
          <div className="px-4 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Menampilkan {(currentPage - 1) * perPage + 1} -{' '}
              {Math.min(currentPage * perPage, total)} dari {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchMerchants(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-700 w-20 text-center">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchMerchants(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <MerchantProductsModal
        isOpen={!!stockMerchant}
        onClose={() => setStockMerchant(null)}
        merchant={stockMerchant}
        onUpdated={() => fetchMerchants(currentPage)}
      />
    </div>
  )
}

export default MerchantList