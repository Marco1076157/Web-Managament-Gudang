import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { categoryService } from '../../api'
import Input from '../../components/Input'
import PageFormLayout from '../../components/form/PageFormLayout'
import FormTextarea from '../../components/form/FormTextarea'
import FileUploadInput from '../../components/form/FileUploadInput'
import {
  buildFormData,
  mapValidationErrors,
  getErrorMessage,
} from '../../utils/formHelpers'

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Satu komponen untuk Add + Edit kategori.
 * Field backend (CategoryRequest): name, slug, tagline, icon, photo (file)
 *
 * `slug` dibuat otomatis dari `name` karena backend mewajibkan slug unik.
 */
const CategoryFormPage = ({ id = null }) => {
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    tagline: '',
    icon: '',
    photo: null,
  })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingPhoto, setExistingPhoto] = useState(null)
  // Slug dibuat manual? Kalau tidak, slug ikut berubah mengikuti nama.
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    if (!isEdit) return

    let active = true
    setLoading(true)
    categoryService
      .getById(id)
      .then((res) => {
        if (!active) return
        const c = res?.data
        if (!c) return
        setFormData({
          name: c.name ?? '',
          slug: c.slug ?? '',
          tagline: c.tagline ?? '',
          icon: c.icon ?? '',
          photo: null,
        })
        setSlugTouched(true)
        setExistingPhoto(c.photo || null)
      })
      .catch((e) => {
        if (active) setMessage(getErrorMessage(e, 'Gagal memuat data kategori.'))
      })
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [id, isEdit])

  const setField = (field) => (e) => {
    const value = e?.target ? e.target.value : e
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setFormData((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugify(name),
    }))
  }

  const validate = () => {
    const next = {}
    if (!formData.name.trim()) next.name = 'Nama kategori wajib diisi.'
    if (!formData.slug.trim()) next.slug = 'Slug wajib diisi.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    if (!validate()) return

    setLoading(true)
    try {
      const payload = buildFormData(formData)
      if (isEdit) {
        await categoryService.update(id, payload)
      } else {
        await categoryService.create(payload)
      }
      navigate('/categories')
    } catch (error) {
      setErrors(mapValidationErrors(error))
      setMessage(getErrorMessage(error, 'Gagal menyimpan kategori.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageFormLayout
      title={isEdit ? 'Edit Kategori' : 'Tambah Kategori'}
      subtitle={
        isEdit
          ? 'Perbarui informasi kategori'
          : 'Kelompokkan produk agar mudah dikelola'
      }
      guideTitle="Quick Guide to Adding Category..."
      guideItems={[
        'Nama kategori harus unik, misalnya "Sembako", "Minuman", "Snack".',
        'Slug dibuat otomatis dari nama dan dipakai pada URL kategori.',
        'Tagline adalah kalimat singkat yang menjelaskan kategori.',
        'Icon diisi nama ikon (contoh: Package, Boxes) atau biarkan kosong.',
        'Foto kategori akan muncul sebagai badge pada daftar produk.',
      ]}
      onBack={() => navigate('/categories')}
      onCancel={() => navigate('/categories')}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'Save Changes' : 'Create Now'}
      submitting={loading}
    >
      {message && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-3 rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {message}
        </div>
      )}

      <FileUploadInput
        label="Category Photo"
        name="photo"
        currentUrl={existingPhoto}
        onChange={(file) => setFormData((prev) => ({ ...prev, photo: file }))}
        error={errors.photo}
      />

      <Input
        label="Category Name"
        name="name"
        placeholder="Contoh: Sembako"
        value={formData.name}
        onChange={handleNameChange}
        error={errors.name}
        required
      />

      <Input
        label="Slug"
        name="slug"
        placeholder="contoh: sayur-mayur"
        value={formData.slug}
        onChange={(e) => {
          setSlugTouched(true)
          setField('slug')(e)
        }}
        error={errors.slug}
        required
      />

      <FormTextarea
        label="Tagline"
        name="tagline"
        placeholder="Kebutuhan pokok sehari-hari"
        value={formData.tagline}
        onChange={setField('tagline')}
        error={errors.tagline}
        rows={3}
      />

      <Input
        label="Icon Name"
        name="icon"
        placeholder="Contoh: Package"
        value={formData.icon}
        onChange={setField('icon')}
        error={errors.icon}
      />
    </PageFormLayout>
  )
}

export default CategoryFormPage