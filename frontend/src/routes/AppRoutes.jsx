import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute, { GuestRoute, homeForRole, getUserRole } from './ProtectedRoute'
import MainLayout from '../components/MainLayout'
import Login from '../pages/Login'
import { useAuth } from '../context/AuthContext'
import Unauthorized from '../pages/Unauthorized'
import Overview from '../pages/Overview'
import CategoryList from '../pages/categories/CategoryList'
import AddCategory from '../pages/categories/AddCategory'
import EditCategory from '../pages/categories/EditCategory'
import ProductList from '../pages/products/ProductList'
import AddProduct from '../pages/products/AddProduct'
import EditProduct from '../pages/products/EditProduct'
import WarehouseList from '../pages/warehouses/WarehouseList'
import AddWarehouse from '../pages/warehouses/AddWarehouse'
import EditWarehouse from '../pages/warehouses/EditWarehouse'
import MerchantList from '../pages/merchants/MerchantList'
import AddMerchant from '../pages/merchants/AddMerchant'
import EditMerchant from '../pages/merchants/EditMerchant'
import UserList from '../pages/users/UserList'
import AddUser from '../pages/users/AddUser'
import EditUser from '../pages/users/EditUser'
import AssignRole from '../pages/users/AssignRole'
import Settings from '../pages/Settings'
import RoleList from '../pages/roles/RoleList'
import AddRole from '../pages/roles/AddRole'
import EditRole from '../pages/roles/EditRole'
import TransactionList from '../pages/transactions/TransactionList'
import OverviewMerchant from '../pages/OverviewMerchant'
import POSTransaction from '../pages/transactions/POSTransaction'
import KeeperTransactionList from '../pages/transactions/KeeperTransactionList'

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<MainLayout />}>
        {/* /overview dibuka untuk manager & keeper (ringkasan role keeper sama). */}
        <Route element={<ProtectedRoute allowedRoles={['manager', 'keeper']} />}>
          <Route path="/overview" element={<Overview />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/categories/add" element={<AddCategory />} />
          <Route path="/categories/edit/:id" element={<EditCategory />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/add" element={<AddProduct />} />
          <Route path="/products/edit/:id" element={<EditProduct />} />
          <Route path="/warehouses" element={<WarehouseList />} />
          <Route path="/warehouses/add" element={<AddWarehouse />} />
          <Route path="/warehouses/edit/:id" element={<EditWarehouse />} />
          <Route path="/merchants" element={<MerchantList />} />
          <Route path="/merchants/add" element={<AddMerchant />} />
          <Route path="/merchants/edit/:id" element={<EditMerchant />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/users/add" element={<AddUser />} />
          <Route path="/users/edit/:id" element={<EditUser />} />
          <Route path="/users/assign-role" element={<AssignRole />} />
          <Route path="/roles" element={<RoleList />} />
          <Route path="/roles/add" element={<AddRole />} />
          <Route path="/roles/edit/:id" element={<EditRole />} />
        </Route>

        {/* Settings dipakai kedua role (menu grup ACCOUNT SETTINGS di sidebar). */}
        <Route element={<ProtectedRoute allowedRoles={['manager', 'keeper']} />}>
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* /transactions punya implementasi beda per role (manager vs keeper).
            Nama path HARUS sama, jadi pasang dispatcher deskriptif per path di sini. */}
        <Route element={<ProtectedRoute />}>
          <Route path="/transactions" element={<RoleAwareTransactions />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['keeper']} />}>
          <Route path="/my-merchant" element={<OverviewMerchant />} />
          <Route path="/pos" element={<POSTransaction />} />
          {/* Wizard transaksi 3-step: target tombol "Add New (+)" di halaman
              Manage Transactions (sama persis dengan /pos). */}
          <Route path="/transactions/create" element={<POSTransaction />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomeRedirect />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

// Mengarahkan root ke dashboard sesuai role
const HomeRedirect = () => {
  const { user } = useAuth()
  return <Navigate to={homeForRole(getUserRole(user))} replace />
}

// /transactions dibuka oleh manager (semua transaksi sistem) maupun keeper
// (transaksi merchant sendiri). React Router memilih route pertama yang cocok,
// jadi dua route dengan path yang sama tidak bisa dibedakan dari order-nya.
// Ganti dengan dispatcher berbasis role.
const RoleAwareTransactions = () => {
  const { user } = useAuth()
  const role = getUserRole(user)

  if (String(role).toLowerCase() === 'keeper') {
    return <KeeperTransactionList />
  }

  return <TransactionList />
}

export default AppRoutes