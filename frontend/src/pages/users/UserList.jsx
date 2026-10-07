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
  User,
  Mail,
  Lock,
} from 'lucide-react'
import { userService } from '../../api'
import { queryKeys } from '../../hooks/queryKeys'
import { useUsers, useRoleOptions } from '../../hooks/useCachedData'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Badge from '../../components/Badge'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import FileUploadInput from '../../components/form/FileUploadInput'

const UserList = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const perPage = 10

  // List user + opsi role memakai cache SWR: halaman tampil instan saat
  // dibuka ulang, perubahan filter memakai data lama dulu (tanpa kedip).
  // Ganti pencarian/filter role me-reset halaman ke 1 dari onChange control.
  const usersQuery = useUsers({
    page,
    per_page: perPage,
    ...(search ? { search } : {}),
    ...(roleFilter ? { role: roleFilter } : {}),
  })
  const rolesQuery = useRoleOptions()

  const roles = rolesQuery.data ?? []
  const { items: users = [], total = 0, totalPages = 1 } = usersQuery.data ?? {}
  const loading = usersQuery.isPending
  const refreshing =
    (usersQuery.isFetching || rolesQuery.isFetching) && !usersQuery.isPending

  // User baru dibuat -> invalidate grup `users` (list) di background.
  const invalidateUsers = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.users })

  // Catatan: fitur Hapus user dinonaktifkan di UI.
  // Endpoint DELETE /api/users/{id} masih tersedia di backend untuk diaktifkan kembali.

  const columns = [
    { key: 'name', header: 'Nama', sortable: true },

    // Sebelumnya `render` mengembalikan hasil konkatenasi string:
    //   <Mail ... /> + val
    // Operator + pada elemen React memaksa objek jadi teks, hasilnya
    // "[object Object]keeper@monday.com". Harus dibungkus elemen JSX.
    {
      key: 'email',
      header: 'Email',
      render: (val) => (
        <span className="inline-flex items-center">
          <Mail className="w-4 h-4 mr-2 text-slate-400 shrink-0" aria-hidden="true" />
          <span className="truncate">{val}</span>
        </span>
      ),
    },

    // Backend mengirim `role` sebagai objek { id, name }. Sebelumnya kolom ini
    // membaca row.role?.name saat `role` masih berisi string nama, jadi
    // selalu jatuh ke '-'.
    {
      key: 'role',
      header: 'Role',
      render: (val, row) => {
        const roleName =
          val?.name ||
          row?.role?.name ||
          row?.roles?.[0]?.name ||
          (typeof val === 'string' ? val : null) ||
          (typeof row?.roles?.[0] === 'string' ? row.roles[0] : null) ||
          null;

        if (!roleName) return <span className="text-slate-400 text-sm">-</span>;

        return (
          <Badge variant={String(roleName).toLowerCase() === 'manager' ? 'primary' : 'info'}>
            {roleName}
          </Badge>
        );
      },
    },

    {
      key: 'merchant.name',
      header: 'Merchant',
      render: (_, row) =>
        row.merchant?.name || row.merchants?.name || (
          <span className="text-slate-400 text-sm">-</span>
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
            onClick={() => navigate(`/users/edit/${row.id}`)}
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
          <h1 className="text-2xl font-bold text-slate-900">User</h1>
          <p className="text-slate-500 mt-1">Kelola pengguna sistem</p>
        </div>
        <div className="flex items-center gap-3">
          {refreshing && (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" aria-label="Memperbarui" />
          )}
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Tambah User
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <Input
              placeholder="Cari user..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setPage(1)
              }}
              className="w-full bg-slate-200 border-none rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
            >
              <option value="">Semua Role</option>
              {roles.map(role => (
                <option key={role.id} value={role.name}>{role.name}</option>
              ))}
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={users}
          keyField="id"
          loading={loading}
          pagination={true}
          pageSize={perPage}
          emptyMessage="Belum ada user"
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
                disabled={page === 1 || usersQuery.isFetching}
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
                disabled={page === totalPages || usersQuery.isFetching}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Di-mount hanya saat terbuka supaya isi form ikut ter-reset tiap kali. */}
      {showAddModal && (
        <AddUserForm
          isOpen
          roles={roles}
          onClose={() => {
            setShowAddModal(false)
            invalidateUsers()
          }}
        />
      )}
    </div>
  )
}

const AddUserForm = ({ isOpen, onClose, roles }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '',
    photo: null,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Nama wajib diisi'
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Format email tidak valid'
    if (!formData.password) newErrors.password = 'Password wajib diisi'
    else if (formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter'
    if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = 'Konfirmasi password tidak cocok'
    if (!formData.role_id) newErrors.role_id = 'Role wajib dipilih'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key])
        }
      })
      await userService.create(formDataToSend)
      onClose()
    } catch (error) {
      console.error('Create user error:', error)
      if (error.response?.data?.errors) {
        const fieldErrors = {}
        Object.keys(error.response.data.errors).forEach(key => {
          fieldErrors[key] = error.response.data.errors[key][0]
        })
        setErrors(fieldErrors)
      } else {
        alert('Gagal menambah user')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah User"
      size="md"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          {/* Tombol ada di luar <form>, jadi dihubungkan lewat atribut `form`. */}
          <Button type="submit" form="add-user-form" loading={loading}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="add-user-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Lengkap"
          name="name"
          placeholder="Masukkan nama lengkap"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
          error={errors.name}
          required
          leftIcon={<User className="w-5 h-5" />}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="user@example.com"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
          error={errors.email}
          required
          leftIcon={<Mail className="w-5 h-5" />}
        />
        <FileUploadInput
          label="Foto Profil"
          name="photo"
          onChange={(file) => setFormData(prev => ({ ...prev, photo: file }))}
          error={errors.photo}
          hint="PNG, JPG, WEBP. Maksimal 2MB."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Minimal 6 karakter"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
            error={errors.password}
            required
            leftIcon={<Lock className="w-5 h-5" />}
            rightIcon={showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
            onRightIconClick={() => setShowPassword(!showPassword)}
          />
          <Input
            label="Konfirmasi Password"
            name="password_confirmation"
            type={showPassword ? 'text' : 'password'}
            placeholder="Ulangi password"
            value={formData.password_confirmation}
            onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
            error={errors.password_confirmation}
            required
            leftIcon={<Lock className="w-5 h-5" />}
          />
        </div>
        <div className="flex flex-col gap-1 w-full">
          <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
          <select
            name="role_id"
            value={formData.role_id}
            onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
            className="w-full bg-slate-200 border-none rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
          >
            <option value="">Pilih Role</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          {errors.role_id && <p className="text-sm text-red-500">{errors.role_id}</p>}
        </div>
      </form>
    </Modal>
  )
}

export default UserList