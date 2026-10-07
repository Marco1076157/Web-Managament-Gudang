# Spesifikasi UI/UX Design (design.md)

## Project: Monday - Warehouse Management System & Point of Sales (POS)

Dokumen ini memuat panduan sistem desain (*Design System*), tata letak antarmuka (*UI Layout*), komponen standar, serta alur pengalaman pengguna (*UX Flow*) untuk aplikasi **Monday**.

## 1. Design System & Style Guide

### 1.1. Color Palette

* **Primary / Accent**: `#1D4ED8` / `bg-blue-600` (Tombol utama, aktif, status brand MONDAY).

* **Brand Logo Accent**: `#F97316` (Elemen warna oranye pada logo Monday).

* **Background Utama**: `#F1F5F9` / `bg-slate-100` (Latar belakang seluruh layar).

* **Card / Container Background**: `#FFFFFF` / `bg-white` (Latar belakang modal/card) & `#E2E8F0` / `bg-slate-200` (Latar belakang input field).

* **Text Colors**:

  * **Primary Text**: `#0F172A` / `text-slate-900` (Judul & Teks Utama).

  * **Secondary Text**: `#64748B` / `text-slate-500` (Placeholder, Subtitle, Help Text).

  * **Muted/Disabled**: `#94A3B8` / `text-slate-400`.

* **Status Colors**:

  * **Success**: `#22C55E` / `text-green-500` (Indikator stok mencukupi, Transaksi Berhasil).

  * **Danger/Error**: `#EF4444` / `text-red-500` (Error stok tidak cukup, tombol hapus).

### 1.2. Typography

* **Font Family**: Inter, Plus Jakarta Sans, atau Sans-Serif modern.

* **Font Weights & Sizes**:

  * **Header (Title)**: `text-2xl` - `text-3xl` (Bold / SemiBold) -> e.g., "Hey 🙌, Welcome Back!".

  * **Subtitle**: `text-sm` - `text-base` (Regular / Medium, Slate-500) -> e.g., "Login to your account to continue!".

  * **Input Text / Label**: `text-sm` (Medium / Regular).

  * **Button Text**: `text-base` (SemiBold / Bold).

### 1.3. Radius & Elevation

* **Card Radius**: `rounded-2xl` / `rounded-3xl` (Sudut membulat lembut sesuai tampilan modern).

* **Input Field Radius**: `rounded-2xl` / `rounded-full` dengan padding internal `py-3 px-4`.

* **Button Radius**: `rounded-full` (Pill-shape button).

* **Shadows**: `shadow-xl` atau `shadow-2xl` lembut pada kontainer card utama.

## 2. Layout & Key Screens Specifications

### 2.1. Authentication Screen (Sign In)

Berdasarkan sampel desain Login Screen:

* **Layout Structure**: Centered Box Card di atas background abu-abu terang (`bg-slate-100`).

* **Components**:

  1. **Header/Logo Section**:

     * Logo Icon Monday (Simbol dua jajaran genjang biru & oranye).

     * Typography Brand **MONDAY** (Bold, Sans-Serif).

  2. **Greeting Section**:

     * Title: **"Hey 👋, Welcome Back!"** (`text-2xl font-bold`).

     * Subtitle: *"Login to your account to continue!"* (`text-sm text-slate-500`).

  3. **Input Group 1 (Email)**:

     * Icon: Mail Envelope (`outline`).

     * Label Top: *"Your email address"*.

     * Input Field: Background abu-abu muda (`bg-slate-200`), placeholder/text value (contoh: `manager@example.com`).

  4. **Input Group 2 (Password)**:

     * Icon Left: Lock (`outline`).

     * Label Top: *"Your password"*.

     * Input Field: Password masked (`••••••••`).

     * Icon Right: Eye/Visibility Toggle (`outline`).

  5. **Helper Text**:

     * *"Forget Password?"* `Reset Password` (Teks interaktif berwarna biru).

  6. **Action Button**:

     * Primary Button: **"Sign In"** (`bg-blue-600 text-white w-full rounded-full py-3.5 font-semibold shadow-md`).

### 2.2. Navigation & Layout Utama (Dashboard Manager & Keeper)

* **Sidebar / Top Navigation**:

  * Brand Logo MONDAY di sudut kiri atas.

  * Role Badge (`Manager` atau `Keeper`).

  * Menu Items:

    * **Manager**: Overview/Dashboard, Categories, Products, Warehouses, Merchants, Users, Transactions.

    * **Keeper**: Merchant Dashboard, Assign POS / Transactions, Stock Items.

### 2.3. Transaksi / POS Wizard Layout (3 Step System - Keeper)

1. **Step Indicator Component**:

   * Progress Bar / Wizard Header: `1. Customer Detail` -> `2. Assign Products` -> `3. Review Transaction`.

2. **Step 1: Input Customer Info**:

   * Form minimalis 2 field: Customer Name & Customer Phone Number.

   * Merchant Banner Info (Menampilkan identitas merchant tempat Keeper bertugas).

3. **Step 2: Assign Products (Modal / Grid)**:

   * Grid Card Produk dengan gambar thumbnail, nama produk, harga, dan **Stock Level Badge**.

   * Counter Quantity (`-` `Qty` `+`) dengan proteksi maksimal sesuai stok yang tersedia.

   * Quick Cart drawer di sisi kanan.

4. **Step 3: Review & Summary**:

   * **List Summary Card**: Detail produk yang dibeli + Subtotal per item.

   * **Cost Breakdown**:

     * Subtotal

     * PPN (10%)

     * **Grand Total** (Teks besar, Bold).

   * **Primary Action**: Button "Save Data" / "Complete Transaction".

5. **Step Success Modal Popup**:

   * Icon centang hijau besar/animasi success.

   * Heading: *"Your Transaction Has Been Successfully Created"*.

   * Detail Ringkasan Biaya.

   * 2 Tombol Aksi: `View Details` (Ghost Button) dan `Back to Transaction` (Primary Button).

## 3. Design System UI Component Guidelines (Tailwind CSS)

```
<!-- Contoh Standard Input Component -->
<div class="flex flex-col gap-1 w-full">
  <div class="relative flex items-center bg-slate-200 rounded-2xl px-4 py-3">
    <svg class="w-5 h-5 text-slate-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">...</svg>
    <div class="flex flex-col w-full">
      <label class="text-xs text-slate-500 font-medium">Your email address</label>
      <input type="email" class="bg-transparent border-none p-0 focus:outline-none text-slate-900 font-semibold text-sm" placeholder="email@domain.com" />
    </div>
  </div>
</div>

<!-- Contoh Standard Primary Button -->
<button class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-full shadow-lg transition-all">
  Sign In
</button>

```

## 4. UX Micro-interactions & Guidelines

1. **Focus States**:

   * Input field saat di-fokuskan memiliki ring/border biru terang (`ring-2 ring-blue-500`).

2. **Button States**:

   * Hover: Tingkat kegelapan warna bertambah (`hover:bg-blue-700`).

   * Active/Pressed: Efek scale down sedikit (`active:scale-95`).

   * Disabled: `bg-slate-300 cursor-not-allowed opacity-60` ketika form belum terisi penuh / stok kosong.

3. **Validation & Feedback**:

   * Pesan error stok muncul langsung pada item produk jika `Qty` melebihi stok yang tersedia di `merchant_products`.

   * Feedback sukses transaksi disajikan dalam bentuk Modal dengan overlay transparan hitam (`bg-black/50`).