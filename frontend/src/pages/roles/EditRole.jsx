import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { roleService } from '../../api'
import Button from '../../components/Button'
import Input from '../../components/Input'

const EditRole = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await roleService.getById(id)
        const role = response.data
        setFormData({
          name: role.name || '',
          description: role.description || '',
        })
      } catch (error) {
        console.error('Fetch role error:', error)
        alert('Gagal memuat data role')
        navigate('/roles')
      } finally {
        setLoading(false)
      }
    }
    fetchRole()
  }, [id, navigate])

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Nama role wajib diisi'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await roleService.update(id, formData)
      navigate('/roles')
    } catch (error) {
      console.error('Update role error:', error)
      if (error.response?.data?.errors) {
        const fieldErrors = {}
        Object.keys(error.response.data.errors).forEach(key => {
          fieldErrors[key] = error.response.data.errors[key][0]
        })
        setErrors(fieldErrors)
      } else {
        alert('Gagal memperbarui role')
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
            <div className="h-28 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/roles')} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Role</h1>
          <p className="text-slate-500">Perbarui data role</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Role"
            name="name"
            placeholder="Contoh: manager, keeper, admin"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
            error={errors.name}
            required
            autoFocus
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
            <Button variant="secondary" type="button" onClick={() => navigate('/roles')} disabled={submitting}>
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

export default EditRole