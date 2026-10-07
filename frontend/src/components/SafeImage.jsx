import { forwardRef } from 'react'
import { PLACEHOLDER_IMAGE } from '../utils/imageFallback'

/**
 * <img> untuk foto profil / thumbnail dengan fallback otomatis.
 *
 * Kalau src kosong atau gagal dimuat (file dihapus dari disk, URL salah),
 * tampilkan placeholder SVG daripada ikon gambar rusak bawaan browser.
 *
 * Semua props <img> biasa tetap bisa dipakai (className, title, onClick, ...).
 */
const SafeImage = forwardRef(function SafeImage(
  { src, alt = '', fallback = PLACEHOLDER_IMAGE, onError, ...props },
  ref
) {
  const handleError = (e) => {
    const img = e.currentTarget

    // Cegah loop tak berujung kalau file placeholder-nya sendiri 404.
    if (img.dataset.fallback === '1') return
    img.dataset.fallback = '1'
    img.src = fallback

    onError?.(e)
  }

  return (
    <img
      ref={ref}
      src={src || fallback}
      alt={alt}
      onError={handleError}
      {...props}
    />
  )
})

export default SafeImage