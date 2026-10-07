import SafeImage from './SafeImage'

/**
 * Avatar untuk user yang sedang login.
 *
 * Kalau user punya foto, tampilkan foto (SafeImage otomatis ke placeholder
 * kalau file-nya hilang). Kalau tidak ada foto, pakai inisial nama.
 */
const UserAvatar = ({ user, className = '' }) => {
  if (user?.photo) {
    return (
      <SafeImage
        src={user.photo}
        alt={user.name || 'Foto profil'}
        className={`w-full h-full object-cover ${className}`}
      />
    )
  }

  return (
    <span className="text-white font-semibold text-sm" aria-hidden="true">
      {user?.name?.charAt(0).toUpperCase() || 'U'}
    </span>
  )
}

export default UserAvatar