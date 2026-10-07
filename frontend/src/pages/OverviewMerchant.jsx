import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Store,
  Package,
  DollarSign,
  Phone,
  User,
  Eye,
  Box,
  Tag,
  Loader2,
} from 'lucide-react'
import { useMyMerchant, useMerchantProducts } from '../hooks/useCachedData'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import SafeImage from '../components/SafeImage'

const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount || 0)

/**
 * Baris produk bergaya card-row: foto, nama + harga, stok, kategori,
 * dan tombol Details di ujung kanan.
 */
const ProductRow = ({ product, onDetail }) => {
  const stock = product.stock || 0

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 sm:px-6 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
      <SafeImage
        src={product.thumbnail}
        alt={product.name}
        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
      />

      <div className="min-w-0 flex-1 basis-40">
        <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
        <p className="text-sm font-medium text-blue-600">{formatCurrency(product.price)}</p>
      </div>

      <div className="flex items-center gap-1.5 text-slate-600 shrink-0">
        <Box className="w-4 h-4 text-slate-400" aria-hidden="true" />
        <span className="text-sm font-medium">{stock} Stock</span>
      </div>

      <Badge variant="info" className="shrink-0">
        <Tag className="w-3.5 h-3.5" aria-hidden="true" />
        {product.category?.name || 'Uncategorized'}
      </Badge>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onDetail(product)}
        className="ml-auto shrink-0"
      >
        <Eye className="w-4 h-4" aria-hidden="true" />
        Details
      </Button>
    </div>
  )
}

const MyMerchant = () => {
  const { user } = useAuth()

  // Data toko + produk memakai cache SWR: saat user berpindah menu dan
  // kembali ke halaman ini, konten langsung dirender dari cache (0 detik),
  // lalu direvalidasi di background tanpa skeleton loader penuh.
  const merchantQuery = useMyMerchant()
  const merchant = merchantQuery.data ?? null
  const productsQuery = useMerchantProducts(merchant?.id)
  const products = productsQuery.data?.items ?? []
  const totalProducts = productsQuery.data?.total ?? 0

  const loading = merchantQuery.isPending
  const error =
    merchantQuery.isError || productsQuery.isError ? 'Gagal memuat data toko' : null

  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const openDetail = (row) => {
    setSelectedProduct(row)
    setDetailOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
          <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
          <div className="h-8 bg-slate-200 rounded w-1/4" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl">
          <div className="h-10 bg-slate-200 rounded mb-4 mx-6 mt-6" />
          <div className="space-y-4 px-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!merchant) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-12 text-center">
        <Store className="w-16 h-16 mx-auto text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Belum ditugaskan ke merchant</h2>
        <p className="text-slate-500">Silakan hubungi admin untuk mendapatkan akses ke toko</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Merchant</h1>
          <p className="text-slate-500 mt-1">
            Daftar produk toko beserta jumlah stok dan kategori.
          </p>
        </div>
        {/* Revalidasi di background: tidak perlu skeleton penuh. */}
        {merchantQuery.isFetching && !merchantQuery.isPending && (
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" aria-label="Memperbarui" />
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Header info merchant */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Store className="w-5 h-5 text-blue-600" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Info Merchant</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Foto toko (thumbnail yang di-upload Manager saat membuat toko) */}
          <div className="w-24 h-24 rounded-2xl bg-slate-100 ring-1 ring-slate-200 overflow-hidden shrink-0">
            <SafeImage
              src={merchant.photo}
              alt={`Foto ${merchant.name}`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Store className="w-4 h-4 text-blue-600" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-500">Nama Toko</p>
                <p className="text-base font-medium text-slate-900 truncate">
                  {merchant.name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-blue-600" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-500">Nomor HP</p>
                <p className="text-base font-medium text-slate-900 truncate">
                  {merchant.phone || '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-blue-600" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-500">Keeper Name</p>
                <p className="text-base font-medium text-slate-900 truncate">
                  {merchant.keeper?.name || user?.name || '-'}{' '}
                  <span className="font-normal text-slate-400">(You)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daftar produk toko */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-900">All Products</h2>
          <span className="ml-auto text-sm font-medium text-slate-500">
            {totalProducts} Total Products
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-500">Belum ada produk di toko ini</p>
          </div>
        ) : (
          <div>
            {products.map((product) => (
              <ProductRow key={product.id} product={product} onDetail={openDetail} />
            ))}
          </div>
        )}
      </div>

      {/* Modal detail produk */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Detail Produk"
        size="md"
      >
        {selectedProduct ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <SafeImage
                src={selectedProduct.thumbnail}
                alt={selectedProduct.name}
                className="h-40 w-40 object-cover rounded-xl border border-gray-200 shadow-sm"
              />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nama Produk</p>
                <p className="text-lg font-semibold text-gray-900">{selectedProduct.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Kategori</p>
                {selectedProduct.category ? (
                  <div className="mt-1">
                    <Badge variant="info">{selectedProduct.category.name}</Badge>
                  </div>
                ) : (
                  <p className="text-gray-900">-</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Harga</p>
                  <p className="text-base font-medium text-gray-900 inline-flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-600" aria-hidden="true" />
                    {formatCurrency(selectedProduct.price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jumlah Stok</p>
                  <div className="mt-1">
                    <Badge
                      variant={
                        (selectedProduct.stock || 0) > 10
                          ? 'success'
                          : (selectedProduct.stock || 0) > 0
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {selectedProduct.stock || 0}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Deskripsi / Tentang Produk</p>
                <p className="text-gray-900 whitespace-pre-line leading-relaxed">
                  {selectedProduct.about || '-'}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={() => setDetailOpen(false)}>
            Tutup
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default MyMerchant
