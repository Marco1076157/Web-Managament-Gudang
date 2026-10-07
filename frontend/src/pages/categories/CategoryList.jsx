import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { categoryService } from '../../api'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Table from '../../components/Table'
import SafeImage from '../../components/SafeImage'

/**
 * Daftar kategori.
 * - Tombol "Tambah Kategori" -&gt; ke /categories/add (BUKAN modal).
 * - Fitur Hapus tidak ditampilkan (menunggu permintaan client).
 */
const CategoryList = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 10

  const fetchCategories = async (page = 1) => {
    try {
      setLoading(true)
      const params = { page, per_page: perPage }
      if (search) params.search = search

      const response = await categoryService.getAll(params)
      setCategories(response.data || [])
      setTotalPages(response.meta?.last_page || 1)
      setTotal(response.meta?.total || 0)
      setCurrentPage(response.meta?.current_page || 1)
    } catch (error) {
      console.error('Fetch categories error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const columns = [
    {
      key: 'photo',
      header: 'Foto',
      align: 'text-center',
      // API selalu mengirim URL (placeholder bila foto kosong), dan SafeImage
      // menangani kasus file hilang dari disk.
      render: (val, row) => (
        <SafeImage
          src={val}
          alt={row.name}
          className="w-12 h-12 rounded-lg object-cover mx-auto"
        />
      ),
    },
    {
      key: 'name',
      header: 'Nama Kategori',
      sortable: true,
      render: (val, row) => (
        <div className="min-w-0">
          <p className="font-medium text-slate-900 truncate">{val}</p>
          {row.slug && (
            <p className="text-xs text-slate-400 truncate">/{row.slug}</p>
          )}
        </div>
      ),
    },
    {
      key: 'tagline',
      header: 'Tagline',
      render: (val) => val || '-',
    },
    {
      key: 'products_count',
      header: 'JUMLAH PRODUK',
      sortable: true,
      render: (val = 0) => `${val} Products`,
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'text-center',
      render: (_, row) => (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/categories/edit/${row.id}`)}
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
          <h1 className="text-2xl font-bold text-slate-900">Kategori</h1>
          <p className="text-slate-500 mt-1">Kelompokkan produk</p>
        </div>
        <Button onClick={() => navigate('/categories/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kategori
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
              placeholder="Cari kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={categories}
          keyField="id"
          loading={loading}
          pagination={false}
          pageSize={perPage}
          emptyMessage="Belum ada kategori"
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
                onClick={() => fetchCategories(currentPage - 1)}
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
                onClick={() => fetchCategories(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Halaman berikutnya"
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

export default CategoryList