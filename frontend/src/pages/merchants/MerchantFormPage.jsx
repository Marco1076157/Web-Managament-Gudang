import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { merchantService, userService } from '../../api'
import Input from '../../components/Input'
import PageFormLayout from '../../components/form/PageFormLayout'
import FormSelect from '../../components/form/FormSelect'
import FormTextarea from '../../components/form/FormTextarea'
import FileUploadInput from '../../components/form/FileUploadInput'
import {
  buildFormData,
  mapValidationErrors,
  getErrorMessage,
} from '../../utils/formHelpers'

/**
 * Satu komponen untuk Add + Edit merchant.
 * Field backend (MerchantRequest): name, address, phone, keeper_id, photo (file)
 *
 * CATATAN: backend memakai `keeper_id` (relasi ke user), BUKAN `keeper_name`.
 */
const MerchantFormPage = ({ id = null }) => {
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [keepers, setKeepers] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    keeper_id: '',
    photo: null,
  })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingPhoto, setExistingPhoto] = useState(null)

  // Daftar keeper (user dengan role keeper)
  useEffect(() => {
    let active = true
    userService
      .getAll({ per_page: 100 })
      .then((res) => {
        if (!active) return
        const users = res?.data || []
        setKeepers(
          users.map((u) => ({
            value: u.id,
            label: u.name || u.email,
          }))
        )
      })
      .catch(() => setKeepers([]))
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!isEdit) return

    let active = true
    setLoading(true)
    merchantService
      .getById(id)
      .then((res) => {
        if (!active) return
        const m = res?.data
        if (!m) return
        setFormData({
          name: m.name ?? '',
          phone: m.phone ?? '',
          address: m.address ?? '',
          keeper_id: m.keeper_id ?? m.keeper?.id ?? '',
          photo: null,
        })
        setExistingPhoto(m.photo || null)
      })
      .catch((e) => {
        if (active) setMessage(getErrorMessage(e, 'Gagal memuat data merchant.'))
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
    if (!formData.name.trim()) next.name = 'Nama merchant wajib diisi.'
    if (!formData.phone.trim()) next.phone = 'Nomor kontak wajib diisi.'
    if (!formData.address.trim()) next.address = 'Alamat wajib diisi.'
    if (!formData.keeper_id) next.keeper_id = 'Keeper wajib dipilih.'
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
        await merchantService.update(id, payload)
      } else {
        await merchantService.create(payload)
      }
      navigate('/merchants')
    } catch (error) {
      setErrors(mapValidationErrors(error))
      setMessage(getErrorMessage(error, 'Gagal menyimpan merchant.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageFormLayout
      title={isEdit ? 'Edit Merchant' : 'Tambah Merchant'}
      subtitle={
        isEdit ? 'Perbarui informasi merchant' : 'Daftarkan titik penjualan baru'
      }
      guideTitle="Quick Guide to Adding Merchant..."
      guideItems={[
        'Nama merchant mencerminkan brand atau nama outlet, contoh "Toko Berkah Jaya".',
        'Pilih satu keeper yang akan bertanggung jawab atas merchant ini.',
        'Nomor kontak diisi format lokal, contoh 081234567890.',
        'Alamat outlet ditulis lengkap agar mudah ditemukan oleh kurir.',
        'Nama merchant harus unik dan belum dipakai merchant lain.',
      ]}
      onBack={() => navigate('/merchants')}
      onCancel={() => navigate('/merchants')}
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
        label="Merchant Photo"
        name="photo"
        currentUrl={existingPhoto}
        onChange={(file) => setFormData((prev) => ({ ...prev, photo: file }))}
        error={errors.photo}
      />

      <Input
        label="Merchant Name"
        name="name"
        placeholder="Contoh: Toko Berkah Jaya"
        value={formData.name}
        onChange={setField('name')}
        error={errors.name}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormSelect
          label="Keeper"
          name="keeper_id"
          value={formData.keeper_id}
          onChange={setField('keeper_id')}
          placeholder="Pilih Keeper"
          options={keepers}
          error={errors.keeper_id}
          required
        />

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
        placeholder="Jalan Merdeka No. 45, Jakarta Pusat"
        value={formData.address}
        onChange={setField('address')}
        error={errors.address}
        rows={3}
        required
      />
    </PageFormLayout>
  )
}

export default MerchantFormPage