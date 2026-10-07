# Alur Sistem & Arsitektur Frontend (React JS)

## 1. Folder Structure Standard
Struktur direktori wajib disusun seperti berikut (menggunakan ekstensi JS/JSX):

```text
frontend/
└── src/
    ├── api/                # Modul panggilan Axios (authService.js, productService.js, dll.)
    ├── assets/             # Gambar, logo, dan file statis
    ├── components/         # Komponen Reusable (Sidebar, Topbar, Card, Modal, Table, Input)
    ├── context/            # React Context definition (AuthContext.js)
    ├── hooks/              # Custom Hooks (useAuth.js, useFetch.js)
    ├── pages/              # Halaman Utama aplikasi
    │   ├── categories/     # CategoryList.jsx, AddCategory.jsx, EditCategory.jsx
    │   ├── merchants/      # MerchantList.jsx, dll.
    │   ├── products/       # ProductList.jsx, dll.
    │   ├── roles/          # RoleList.jsx, dll.
    │   ├── transactions/   # TransactionList.jsx, POSTransaction.jsx
    │   ├── users/          # UserList.jsx, dll.
    │   ├── warehouses/     # WarehouseList.jsx, dll.
    │   ├── Landing.jsx
    │   ├── Login.jsx
    │   ├── MyMerchantProfile.jsx
    │   ├── Overview.jsx
    │   ├── OverviewMerchant.jsx
    │   ├── Profile.jsx
    │   └── Unauthorized.jsx
    ├── providers/          # Provider wrapper (AuthProvider.jsx)
    ├── routes/             # Definisikan ProtectedRoute.jsx dan AppRoutes.jsx
    ├── App.jsx             # Entry component dengan Router
    ├── main.jsx            # ReactDOM Render
    └── index.css           # Tailwind Setup & Global Styles