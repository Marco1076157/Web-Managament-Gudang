import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { roleService } from '../../api'
import Button from '../../components/Button'
import Input from '../../components/Input'

const AddRole = () => {
  const navigate = useNavigate()
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
      navigate('/roles')
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/roles')} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Role</h1>
          <p className="text-slate-500">Buat role baru</p>
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
            <Button variant="secondary" type="button" onClick={() => navigate('/roles')} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" loading={loading}>
              <Loader2 className="w-4 h-4" />
              Simpan
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddRole