import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { warehouseService } from '../../api'
import Input from '../../components/Input'
import PageFormLayout from '../../components/form/PageFormLayout'
import FormTextarea from '../../components/form/FormTextarea'
import FileUploadInput from '../../components/form/FileUploadInput'
import {
  buildFormData,
  mapValidationErrors,
  getErrorMessage,
} from '../../utils/formHelpers'

/**
 * Satu komponen untuk Add + Edit gudang.
 * Field backend (WarehouseRequest): name, address, phone, photo (file)
 */
const WarehouseFormPage = ({ id = null }) => {
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    photo: null,
  })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingPhoto, setExistingPhoto] = useState(null)

  useEffect(() => {
    if (!isEdit) return

    let active = true
    setLoading(true)
    warehouseService
      .getById(id)
      .then((res) => {
        if (!active) return
        const w = res?.data
        if (!w) return
        setFormData({
          name: w.name ?? '',
          phone: w.phone ?? '',
          address: w.address ?? '',
          photo: null,
        })
        setExistingPhoto(w.photo || null)
      })
      .catch((e) => {
        if (active) setMessage(getErrorMessage(e, 'Gagal memuat data gudang.'))
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

  const validate = () => {
    const next = {}
    if (!formData.name.trim()) next.name = 'Nama gudang wajib diisi.'
    if (!formData.phone.trim()) next.phone = 'Nomor kontak wajib diisi.'
    if (!formData.address.trim()) next.address = 'Alamat wajib diisi.'
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
        await warehouseService.update(id, payload)
      } else {
        await warehouseService.create(payload)
      }
      navigate('/warehouses')
    } catch (error) {
      setErrors(mapValidationErrors(error))
      setMessage(getErrorMessage(error, 'Gagal menyimpan gudang.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageFormLayout
      title={isEdit ? 'Edit Gudang' : 'Tambah Gudang'}
      subtitle={
        isEdit ? 'Perbarui informasi gudang' : 'Tambahkan lokasi penyimpanan baru'
      }
      guideTitle="Quick Guide to Adding Warehouse..."
      guideItems={[
        'Gunakan nama gudang yang mudah dikenali, misalnya "Gudang Utama Bandung".',
        'Nomor kontak diisi format lokal, contoh 081234567890 (maksimal 15 digit).',
        'Alamat ditulis lengkap sampai nama jalan atau patokan agar mudah ditemukan.',
        'Foto gudang membantu tim recognise lokasi saat inspeksi.',
        'Nama gudang harus unik dan tidak boleh sama dengan gudang lain.',
      ]}
      onBack={() => navigate('/warehouses')}
      onCancel={() => navigate('/warehouses')}
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
        label="Warehouse Photo"
        name="photo"
        currentUrl={existingPhoto}
        onChange={(file) => setFormData((prev) => ({ ...prev, photo: file }))}
        error={errors.photo}
      />

      <Input
        label="Warehouse Name"
        name="name"
        placeholder="Contoh: Gudang Utama Bandung"
        value={formData.name}
        onChange={setField('name')}
        error={errors.name}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Phone / Contact"
          name="phone"
          placeholder="081234567890"
          value={formData.phone}
          onChange={setField('phone')}
          error={errors.phone}
          required
        />
      </div>

      <FormTextarea
        label="Address / Location"
        name="address"
        placeholder="Jalan Raya No. 123, Bandung, Jawa Barat"
        value={formData.address}
        onChange={setField('address')}
        error={errors.address}
        rows={3}
        required
      />
    </PageFormLayout>
  )
}

export default WarehouseFormPage