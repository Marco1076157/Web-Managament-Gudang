import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Edit,
} from 'lucide-react'
import { roleService } from '../../api'
import { queryKeys } from '../../hooks/queryKeys'
import { useRoles } from '../../hooks/useCachedData'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Table from '../../components/Table'
import Modal from '../../components/Modal'

const RoleList = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)

  const perPage = 10

  // Daftar role memakai cache SWR: halaman ini langsung tampil dari cache
  // saat dibuka lagi, tanpa skeleton loader penuh.
  const rolesQuery = useRoles({ page, per_page: perPage, search })
  const { items: roles = [], total = 0, totalPages = 1 } = rolesQuery.data ?? {}
  const loading = rolesQuery.isPending
  const refreshing = rolesQuery.isFetching && !rolesQuery.isPending

  // Role baru dibuat -> invalidate seluruh grup `roles` (list + opsi dropdown).
  const invalidateRoles = () => queryClient.invalidateQueries({ queryKey: queryKeys.roles })

  const columns = [
    { key: 'name', header: 'Nama Role', sortable: true },

    { key: 'users_count', header: 'USERS', sortable: true, render: (val = 0) => `${val} user` },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'text-center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/roles/edit/${row.id}`)}
            className="p-2"
            aria-label={`Edit ${row.name}`}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Role & Permission</h1>
          <p className="text-slate-500 mt-1">Kelola role dan hak akses pengguna</p>
        </div>
        <div className="flex items-center gap-3">
          {refreshing && (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" aria-label="Memperbarui" />
          )}
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Tambah Role
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl">
        <div className="p-4 border-b border-slate-200">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <Input
              placeholder="Cari role..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={roles}
          keyField="id"
          loading={loading}
          pagination={true}
          pageSize={perPage}
          emptyMessage="Belum ada role"
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
                disabled={page === 1 || rolesQuery.isFetching}
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
                disabled={page === totalPages || rolesQuery.isFetching}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Role"
        size="md"
      >
        <AddRoleForm
          onClose={() => {
            setShowAddModal(false)
            invalidateRoles()
          }}
        />
      </Modal>
    </div>
  )
}

const AddRoleForm = ({ onClose }) => {
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Nama role wajib diisi'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await roleService.create(formData)
      onClose()
    } catch (error) {
      console.error('Create role error:', error)
      if (error.response?.data?.errors) {
        const fieldErrors = {}
        Object.keys(error.response.data.errors).forEach(key => {
          fieldErrors[key] = error.response.data.errors[key][0]
        })
        setErrors(fieldErrors)
      } else {
        alert('Gagal menambah role')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nama Role"
        name="name"
        placeholder="Contoh: manager, keeper, admin"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
        error={errors.name}
        required
      />
      <Input
        label="Deskripsi"
        name="description"
        placeholder="Deskripsi role (opsional)"
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
        type="textarea"
      />
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button type="submit" loading={loading}>
          Simpan
        </Button>
      </div>
    </form>
  )
}

export default RoleList