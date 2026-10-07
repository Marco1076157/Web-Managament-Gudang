import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { userService, roleService } from '../../api'
import Button from '../../components/Button'
import Input from '../../components/Input'
import FileUploadInput from '../../components/form/FileUploadInput'

const EditUser = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [roles, setRoles] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '',
    photo: null,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rolesLoading, setRolesLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  // Foto lama dari server. Pisahkan dari formData.photo karena field itu
  // menyimpan File hasil pilihan user (atau null), bukan URL.
  const [existingPhoto, setExistingPhoto] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, rolesRes] = await Promise.all([
          userService.getById(id),
          roleService.getAll({ per_page: 100 }),
        ])
        const user = userRes.data
        setFormData({
          name: user.name || '',
          email: user.email || '',
          password: '',
          password_confirmation: '',
          role_id: user.role_id || '',
          photo: null,
        })
        setExistingPhoto(user.photo || null)
        setRoles(rolesRes.data || [])
      } catch (error) {
        console.error('Fetch user error:', error)
        alert('Gagal memuat data user')
        navigate('/users')
      } finally {
        setLoading(false)
        setRolesLoading(false)
      }
    }
    fetchData()
  }, [id, navigate])

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Nama wajib diisi'
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Format email tidak valid'
    if (formData.password && formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter'
    if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = 'Konfirmasi password tidak cocok'
    if (!formData.role_id) newErrors.role_id = 'Role wajib dipilih'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          formDataToSend.append(key, formData[key])
        }
      })
      // For update, we need to use POST with _method=PUT for FormData
      formDataToSend.append('_method', 'PUT')
      await userService.update(id, formDataToSend)
      navigate('/users')
    } catch (error) {
      console.error('Update user error:', error)
      if (error.response?.data?.errors) {
        const fieldErrors = {}
        Object.keys(error.response.data.errors).forEach(key => {
          fieldErrors[key] = error.response.data.errors[key][0]
        })
        setErrors(fieldErrors)
      } else {
        alert('Gagal memperbarui user')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-6" />
          <div className="space-y-4">
            <div className="h-10 bg-slate-200 rounded" />
            <div className="h-10 bg-slate-200 rounded" />
            <div className="h-10 bg-slate-200 rounded" />
            <div className="h-10 bg-slate-200 rounded" />
            <div className="h-10 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/users')} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit User</h1>
          <p className="text-slate-500">Perbarui data pengguna</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            name="name"
            placeholder="Masukkan nama lengkap"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
            error={errors.name}
            required
            autoFocus
            leftIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
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
            leftIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
          />
          <FileUploadInput
            label="Foto Profil"
            name="photo"
            currentUrl={existingPhoto}
            onChange={(file) => setFormData(prev => ({ ...prev, photo: file }))}
            error={errors.photo}
            hint="PNG, JPG, WEBP. Maksimal 2MB."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Password (kosongkan jika tidak diubah)"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimal 6 karakter"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              error={errors.password}
              leftIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
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
              leftIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
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
              disabled={rolesLoading}
            >
              <option value="">Pilih Role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            {errors.role_id && <p className="text-sm text-red-500">{errors.role_id}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate('/users')} disabled={submitting}>
              Batal
            </Button>
            <Button type="submit" loading={submitting}>
              <Loader2 className="w-4 h-4" />
              Perbarui
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditUser