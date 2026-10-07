<?php

namespace App\Models\Concerns;

trait ResolvesPublicFileUrl
{
    /**
     * Path placeholder yang dipakai saat kolom gambar kosong atau file sudah
     * hilang dari disk.
     *
     * Diletakkan di public/uploads/ (bukan storage/app/public) supaya file-nya
     * ikut ter-commit dan tidak hilang saat storage di-clear. Folder public
     * selalu dilayani langsung tanpa butuh symlink.
     */
    protected const PLACEHOLDER_PATH = '/uploads/placeholder-user.svg';

    /**
     * Ubah path file di disk `public` menjadi URL absolut yang bisa dimuat
     * browser.
     *
     * Hasilnya SELALU URL lengkap (http://host/storage/...) dan bukan path
     * relatif, supaya aman dipakai baik oleh API consumer, Blade, maupun SPA
     * yang di-host di origin/domain berbeda.
     *
     * Base URL diambil dari ASSET_URL bila diisi (mis. https://cdn.example.com),
     * jika tidak memakai APP_URL.
     *
     * SELALU URL absolut: frontend di-host di origin/domain berbeda tidak bisa
     * memuat path relatif seperti /storage/... karena Vite tidak melayani file
     * backend.
     */
    protected function publicFileUrl(?string $value): ?string
    {
        $value = $value === null ? null : trim($value);

        // Sudah URL lengkap (mis. foto avatar bawaan seeder) atau protocol
        // relatif seperti data: / blob:, biarkan apa adanya supaya frontend
        // bisa memuatnya langsung.
        if ($value !== null && preg_match('#^(?:[a-z][a-z0-9+.\-]*:|//)#i', $value)) {
            return $value;
        }

        $base = $this->publicFileBaseUrl();

        $path = $this->normalizePublicFilePath($value);

        if ($path === null) {
            return $base.self::PLACEHOLDER_PATH;
        }

        return "{$base}/storage/{$path}";
    }

    /**
     * Base URL untuk aset publik, tanpa garis miring di akhir.
     */
    protected function publicFileBaseUrl(): string
    {
        $base = config('app.asset_url') ?: config('app.url');

        return rtrim((string) $base, '/');
    }

    /**
     * Bersihkan nilai kolom gambar menjadi path relatif terhadap
     * storage/app/public.
     *
     * Mengembalikan null kalau tidak ada path yang bisa dipakai (null atau string
     * kosong). Path absolut dari luar sudah ditangani di publicFileUrl().
     *
     * Menangani slash ganda dan prefix storage/ yang supaya tidak jadi
     * /storage//storage/...:
     * - "/storage/users/a.png"  -> "users/a.png"
     * - "storage/users/a.png"   -> "users/a.png"
     * - "users/a.png"           -> "users/a.png"
     * - "/users/a.png"          -> "users/a.png"
     */
    protected function normalizePublicFilePath(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $path = ltrim(preg_replace('#/+#', '/', trim($value)), '/');

        // Buang prefix storage/ berulang supaya tidak jadi /storage/storage/.
        while (preg_match('#^storage/#i', $path)) {
            $path = substr($path, strlen('storage/'));
        }

        return $path === '' ? null : $path;
    }
}
