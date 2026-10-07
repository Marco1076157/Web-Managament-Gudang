/**
 * Placeholder untuk gambar yang gagal dimuat.
 *
 * Path relatif supaya host-agnostic:
 * - dev  : Vite menyajikan file statis dari frontend/public
 * - prod : ikut ter-copy ke dist/ oleh build
 *
 * Backend punya salinan identik di backend/public/uploads/ yang dipakai untuk
 * nilai photo/thumbnail kosong dari API.
 */
export const PLACEHOLDER_IMAGE = '/uploads/placeholder-user.svg'