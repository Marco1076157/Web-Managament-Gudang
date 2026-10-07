/**
 * Mengubah object form biasa + berkas foto menjadi FormData untuk multipart upload.
 *
 * Aturan:
 * - Nilai kosong ('', null, undefined) TIDAK ikut dikirim agar tidak menimpa
 *   nilai lama di database saat update tanpa memilih foto baru.
 * - Field checkbox dikirim sebagai '1'/'0' (Laravel boolean).
 * - File dikirim apa adanya; axios yang akan membuat multipart boundary.
 */
export const buildFormData = (data) => {
  const form = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) return

    if (value instanceof File) {
      if (value.size > 0) form.append(key, value)
      return
    }

    if (typeof value === 'boolean') {
      form.append(key, value ? '1' : '0')
      return
    }

    form.append(key, String(value))
  })

  return form
}

/**
 * Memetakan error validasi Laravel (422) menjadi { field: pesan pertama }.
 */
export const mapValidationErrors = (error) => {
  const errors = error?.response?.data?.errors
  if (!errors) return {}

  const mapped = {}
  Object.entries(errors).forEach(([key, messages]) => {
    mapped[key] = Array.isArray(messages) ? messages[0] : String(messages)
  })
  return mapped
}

/**
 * Mengambil pesan error umum dari respons Laravel.
 */
export const getErrorMessage = (error, fallback = 'Terjadi kesalahan.') =>
  error?.response?.data?.message || fallback