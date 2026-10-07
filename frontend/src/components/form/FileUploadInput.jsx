import { useEffect, useRef, useState } from 'react'
import { Upload, Image as ImageIcon, X } from 'lucide-react'
import SafeImage from '../SafeImage'

/**
 * `currentUrl` hanya boleh berupa URL string milik server (foto lama saat
 * mode edit).
 *
 * Caller sering mengirim objek File hasil pilihan user karena field form-nya
 * dipakai untuk dua hal sekaligus (state upload DAN currentUrl). Kalau objek
 * File ini dipakai sebagai src <img>, browser gagal memuatnya dan SafeImage
 * akan menampilkan placeholder — itulah bug "preview tidak pernah berubah".
 */
const isServerUrl = (value) =>
  typeof value === 'string' && value.trim().length > 0

/**
 * Input upload gambar (file) dengan kotak preview.
 *
 * - accept="image/*" -> hanya menerima berkas gambar
 * - Menampilkan preview lokal via URL.createObjectURL SEBELUM di-upload,
 *   supaya user bisa melihat gambarnya sebelum klik Simpan.
 * - Objek URL HARUS di-revoke, kalau tidak akan bocor (memory leak).
 */
const FileUploadInput = ({
  label = 'Photo',
  name = 'photo',
  accept = 'image/*',
  currentUrl = null,
  onChange,
  error = '',
  disabled = false,
  hint = 'PNG, JPG, WEBP. Maksimal 2MB.',
}) => {
  const inputRef = useRef(null)
  const objectUrlRef = useRef(null)

  // Preview blob milik file yang baru dipilih user (belum di-upload).
  const [localPreview, setLocalPreview] = useState(null)
  // Apakah foto sengaja dikosongkan lewat tombol Hapus. Tanpa flag ini,
  // preview langsung balik ke currentUrl padahal user mau menghapusnya.
  const [removed, setRemoved] = useState(false)
  const [fileName, setFileName] = useState('')

  // Revoke object URL saat component dilepas supaya tidak bocor (memory leak).
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  // Di-derive, bukan di-sync lewat useEffect: begitu currentUrl (foto lama
  // dari server) berubah, render berikutnya ikut berubah tanpa setState.
  const serverPreview = !removed && isServerUrl(currentUrl) ? currentUrl : null
  const preview = localPreview || serverPreview

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setLocalPreview(url)
    setRemoved(false)
    setFileName(file.name)
    onChange?.(file)
  }

  const clear = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setLocalPreview(null)
    setFileName('')
    setRemoved(true)
    onChange?.(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const labelText =
    fileName || (serverPreview ? 'Ganti Photo' : 'Add Photo')

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <span className="text-xs font-semibold text-slate-500 ml-1">{label}</span>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Kotak preview */}
        <div className="w-full sm:w-40 shrink-0">
          <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden relative">
            {preview ? (
              <SafeImage
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-slate-400" aria-hidden="true" />
            )}

            {preview && (
              <button
                type="button"
                onClick={clear}
                disabled={disabled}
                aria-label="Hapus foto"
                className="absolute top-2 right-2 p-1 rounded-full bg-white/90 text-slate-600 hover:bg-white hover:text-red-600 shadow disabled:opacity-50"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Kontrol */}
        <div className="flex flex-col justify-center gap-2 min-w-0 flex-1">
          <input
            ref={inputRef}
            id={name}
            name={name}
            type="file"
            accept={accept}
            disabled={disabled}
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="sr-only"
            aria-label={label}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition-all active:scale-95 disabled:opacity-60"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              {labelText}
            </button>

            {preview && (
              <button
                type="button"
                onClick={clear}
                disabled={disabled}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold transition-all active:scale-95 disabled:opacity-60"
              >
                <X className="w-4 h-4" aria-hidden="true" />
                Hapus
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400">{hint}</p>
        </div>
      </div>

      {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
    </div>
  )
}

export default FileUploadInput