import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Check } from 'lucide-react'
import { productService, categoryService } from '../../api'
import Input from '../../components/Input'
import PageFormLayout from '../../components/form/PageFormLayout'
import FormSelect from '../../components/form/FormSelect'
import FormTextarea from '../../components/form/FormTextarea'
import FileUploadInput from '../../components/form/FileUploadInput'
import SafeImage from '../../components/SafeImage'
import {
  buildFormData,
  mapValidationErrors,
  getErrorMessage,
} from '../../utils/formHelpers'

/**
 * Satu komponen untuk Add + Edit produk supaya nama field dijamin 100%
 * sama dengan backend (ProductRequest).
 *
 * Field backend: name, thumbnail (file), about, price, category_id, is_popular
 */
const ProductFormPage = ({ id = null }) => {
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    thumbnail: null,
    about: '',
    price: '',
    category_id: '',
    is_popular: false,
  })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  // Foto yang sudah tersimpan di server (mode edit) -> ditampilkan sebagai preview.
  const [existingPhoto, setExistingPhoto] = useState(null)

  // Kategori (untuk dropdown + preview foto kategori)
  useEffect(() => {
    let active = true
    categoryService
      .getAll({ per_page: 100 })
      .then((res) => {
        if (active) setCategories(res?.data || [])
      })
      .catch(() => setCategories([]))
    return () => {
      active = false
    }
  }, [])

  // Mode edit: ambil data existing
  useEffect(() => {
    if (!isEdit) return

    let active = true
    setLoading(true)
    productService
      .getById(id)
      .then((res) => {
        if (!active) return
        const p = res?.data
        if (!p) return
        setFormData({
          name: p.name ?? '',
          thumbnail: null, // foto existing ditampilkan lewat currentUrl
          about: p.about ?? '',
          price: p.price ?? '',
          category_id: p.category_id ?? '',
          is_popular: Boolean(p.is_popular),
        })
        setExistingPhoto(p.thumbnail || null)
      })
      .catch((e) => {
        if (active) setMessage(getErrorMessage(e, 'Gagal memuat data produk.'))
      })
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [id, isEdit])

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === String(formData.category_id)),
    [categories, formData.category_id]
  )

  const setField = (field) => (e) => {
    const value = e?.target ? e.target.value : e
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    const next = {}
    if (!formData.name.trim()) next.name = 'Nama produk wajib diisi.'
    if (!formData.category_id) next.category_id = 'Kategori wajib dipilih.'
    if (formData.price === '' || parseFloat(formData.price) < 0) {
      next.price = 'Harga wajib diisi dan tidak boleh negatif.'
    }
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
        await productService.update(id, payload)
      } else {
        await productService.create(payload)
      }
      navigate('/products')
    } catch (error) {
      setErrors(mapValidationErrors(error))
      setMessage(getErrorMessage(error, 'Gagal menyimpan produk.'))
    } finally {
      setLoading(false)
    }
  }

  const guideFooter = selectedCategory ? (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center shrink-0">
        <SafeImage
          src={selectedCategory.photo}
          alt={selectedCategory.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">Kategori terpilih</p>
        <p className="text-sm font-bold text-slate-900 truncate">
          {selectedCategory.name}
        </p>
      </div>
    </div>
  ) : null

  return (
    <PageFormLayout
      title={isEdit ? 'Edit Produk' : 'Tambah Produk'}
      subtitle={
        isEdit
          ? 'Perbarui informasi produk yang sudah ada'
          : 'Lengkapi data produk untuk mulai berjualan'
      }
      guideTitle="Quick Guide to Adding Product..."
      guideItems={[
        'Gunakan nama produk yang jelas dan mudah dicari, misalnya "Beras Pandan Wangi 5kg".',
        'Pilih satu kategori agar produk mudah dikelompokkan dan ditemukan.',
        'Harga diisi angka saja tanpa titik atau koma, misalnya 15000.',
        'Deskripsi singkat membantu pelanggan memahami isi produk.',
        'Unggah foto produk Square agar tampil rapi di katalog.',
      ]}
      guideFooter={guideFooter}
      onBack={() => navigate('/products')}
      onCancel={() => navigate('/products')}
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
        label="Product Photo"
        name="thumbnail"
        currentUrl={existingPhoto}
        onChange={(file) => setFormData((prev) => ({ ...prev, thumbnail: file }))}
        error={errors.thumbnail}
      />

      <Input
        label="Product Name"
        name="name"
        placeholder="Masukkan nama produk"
        value={formData.name}
        onChange={setField('name')}
        error={errors.name}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormSelect
          label="Category"
          name="category_id"
          value={formData.category_id}
          onChange={setField('category_id')}
          placeholder="Pilih Kategori"
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          error={errors.category_id}
          required
        />

        <Input
          label="Price"
          name="price"
          type="number"
          min="0"
          step="1"
          placeholder="15000"
          value={formData.price}
          onChange={setField('price')}
          error={errors.price}
          required
        />
      </div>

      <FormTextarea
        label="About Product"
        name="about"
        placeholder="Ceritakan singkat tentang produk ini"
        value={formData.about}
        onChange={setField('about')}
        error={errors.about}
        rows={4}
      />

      <label className="flex items-center gap-3 cursor-pointer w-fit">
        <input
          type="checkbox"
          name="is_popular"
          checked={formData.is_popular}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, is_popular: e.target.checked }))
          }
          className="w-4 h-4 rounded border-slate-400 text-blue-600 focus:ring-blue-500 focus:ring-2"
        />
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <Check className="w-4 h-4 text-slate-400" aria-hidden="true" />
          Tandai sebagai produk populer
        </span>
      </label>
    </PageFormLayout>
  )
}

export default ProductFormPage