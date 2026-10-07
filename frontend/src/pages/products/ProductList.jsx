import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Star,
  Eye,
} from 'lucide-react'
import { useProducts, useCategoryOptions } from '../../hooks/useCachedData'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Badge from '../../components/Badge'
import Table from '../../components/Table'
import SafeImage from '../../components/SafeImage'
import Modal from '../../components/Modal'
import FormSelect from '../../components/form/FormSelect'

/**
 * Daftar produk.
 * - Tombol "Tambah Produk" -&gt; ke halaman form /products/add (BUKAN modal).
 * - Fitur Hapus sengaja TIDAK ditampilkan (menunggu permintaan client).
 * - Kategori ditampilkan sebagai badge + thumbnail foto kategori.
 */
const ProductList = () => {
  const navigate = useNavigate()
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  // List produk + opsi kategori memakai cache SWR: halaman tampil instan
  // saat dibuka ulang, tanpa skeleton loader penuh. Ganti pencarian/filter
  // me-reset halaman ke 1 langsung dari onChange control.
  const categoriesQuery = useCategoryOptions()
  const categories = categoriesQuery.data ?? []

  const params = useMemo(() => ({
    page,
    per_page: perPage,
    ...(search ? { search } : {}),
    ...(categoryFilter ? { category_id: categoryFilter } : {}),
  }), [page, search, categoryFilter])

  const productsQuery = useProducts(params)
  const { items: products = [], total = 0, totalPages = 1 } =
    productsQuery.data ?? {}
  const loading = productsQuery.isPending
  const refreshing = productsQuery.isFetching && !productsQuery.isPending

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0)

  const formatIDR = formatCurrency

  const openDetail = (row) => {
    setSelectedProduct(row)
    setDetailOpen(true)
  }

  const columns = [
    {
      key: 'thumbnail',
      header: 'Gambar',
      align: 'text-center',
      width: '84px',
      render: (val, row) => (
        <SafeImage
          src={val}
          alt={row.name || 'Produk'}
          className="w-12 h-12 rounded-lg object-cover mx-auto"
        />
      ),
    },
    {
      key: 'name',
      header: 'Nama Produk',
      sortable: true,
      nowrap: false,
      render: (val, row) => (
        <div className="min-w-0">
          <p className="font-medium text-slate-900 truncate">{val}</p>
          {row.is_popular ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 mt-0.5">
              <Star className="w-3 h-3" aria-hidden="true" />
              Populer
            </span>
          ) : null}
        </div>
      ),
    },
    {
      // Kategori + thumbnail foto kategori
      key: 'category',
      header: 'Kategori',
      nowrap: false,
      render: (_, row) => {
        const cat = row.category
        if (!cat) {
          return <span className="text-slate-400 text-sm">-</span>
        }
        return (
          <span className="inline-flex items-center gap-2">
            <SafeImage
              src={cat.photo}
              alt={cat.name}
              title={cat.name}
              className="w-6 h-6 rounded-md object-cover shrink-0 ring-1 ring-slate-200"
            />
            <Badge variant="info">{cat.name}</Badge>
          </span>
        )
      },
    },
    {
      key: 'price',
      header: 'Harga',
      align: 'text-right',
      sortable: true,
      width: '160px',
      render: (val) => (
        <span className="inline-block tabular-nums whitespace-nowrap">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'text-center',
      width: '84px',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openDetail(row)}
            className="p-2"
            aria-label={`Detail ${row.name}`}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/products/edit/${row.id}`)}
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
          <h1 className="text-2xl font-bold text-slate-900">Produk</h1>
          <p className="text-slate-500 mt-1">Kelola katalog produk</p>
        </div>
        <div className="flex items-center gap-3">
          {refreshing && (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" aria-label="Memperbarui" />
          )}
          <Button onClick={() => navigate('/products/add')}>
            <Plus className="w-4 h-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none"
              aria-hidden="true"
            />
            <Input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-56">
            <FormSelect
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setPage(1)
              }}
              placeholder="Semua Kategori"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={products}
          keyField="id"
          loading={loading}
          pagination={false}
          pageSize={perPage}
          emptyMessage="Belum ada produk"
        />

        {totalPages > 1 && (
          <div className="px-4 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Menampilkan{' '}
              {(page - 1) * perPage + 1} -{' '}
              {Math.min(page * perPage, total)} dari {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1 || productsQuery.isFetching}
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-700 w-20 text-center">
                {page} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages || productsQuery.isFetching}
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Detail Produk"
        size="md"
      >
        {selectedProduct ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <SafeImage
                src={selectedProduct.thumbnail}
                alt={selectedProduct.name}
                className="h-40 w-40 object-cover rounded-xl border border-gray-200 shadow-sm"
              />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nama Produk</p>
                <p className="text-lg font-semibold text-gray-900">{selectedProduct.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Kategori</p>
                {selectedProduct.category ? (
                  <div className="flex items-center gap-2 mt-1">
                    <SafeImage
                      src={selectedProduct.category.photo}
                      alt={selectedProduct.category.name}
                      className="h-6 w-6 object-cover rounded border border-gray-200"
                    />
                    <Badge variant="secondary">{selectedProduct.category.name}</Badge>
                  </div>
                ) : (
                  <p className="text-gray-900">-</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">Harga Produk</p>
                <p className="text-base font-medium text-gray-900">
                  {formatIDR(selectedProduct.price)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Deskripsi / Tentang Produk</p>
                <p className="text-gray-900 whitespace-pre-line leading-relaxed">
                  {selectedProduct.about || '-'}
                </p>
              </div>

              {selectedProduct.is_popular && (
                <div>
                  <Badge variant="warning">Produk Populer</Badge>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={() => setDetailOpen(false)}>
            Tutup
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default ProductList