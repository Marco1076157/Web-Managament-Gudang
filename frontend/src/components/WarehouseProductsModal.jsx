import { useCallback, useEffect, useState } from 'react'
import { PackageX, Plus, Pencil, Trash2, Save, X, CheckCircle2 } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'
import Input from './Input'
import FormSelect from './form/FormSelect'
import Badge from './Badge'
import SafeImage from './SafeImage'
import { warehouseService, productService } from '../api'

/**
 * Modal "Kelola Stok" untuk sebuah gudang.
 * Manager bisa:
 *  - menambah produk baru ke gudang (beserta stok awal),
 *  - mengubah stok produk yang sudah ada,
 *  - dan mengeluarkan produk dari gudang.
 */
const WarehouseProductsModal = ({ isOpen, onClose, warehouse, onUpdated }) => {
  const warehouseId = warehouse?.id

  const [products, setProducts] = useState([])
  const [availableProducts, setAvailableProducts] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [newStock, setNewStock] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingStock, setEditingStock] = useState('')
  const [removingId, setRemovingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  const load = useCallback(async () => {
    if (!warehouseId) return
    try {
      setLoading(true)
      setError(null)
      const [productsRes, allRes] = await Promise.all([
        warehouseService.getProducts(warehouseId, { per_page: 100 }),
        productService.getAll({ per_page: 100 }),
      ])
      const inWarehouse = productsRes.data || []
      const all = allRes.data || []
      const inWarehouseIds = new Set(inWarehouse.map((p) => p.id))
      setProducts(inWarehouse)
      setAvailableProducts(all.filter((p) => !inWarehouseIds.has(p.id)))
    } catch (err) {
      console.error('Load warehouse products error:', err)
      setError('Gagal memuat stok gudang.')
    } finally {
      setLoading(false)
    }
  }, [warehouseId])

  useEffect(() => {
    if (isOpen && warehouseId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      load()
    }
  }, [isOpen, warehouseId, load])

  const flashNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(null), 2500)
  }

  const handleAdd = async () => {
    if (!selectedProductId) {
      setError('Pilih produk terlebih dahulu.')
      return
    }
    const stock = parseInt(newStock, 10)
    if (!Number.isInteger(stock) || stock < 1) {
      setError('Stok awal harus angka minimal 1.')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await warehouseService.attachProduct(warehouseId, selectedProductId, stock)
      setSelectedProductId('')
      setNewStock('')
      flashNotice('Produk berhasil ditambahkan ke gudang.')
      onUpdated?.()
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambahkan produk ke gudang.')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (product) => {
    setEditingId(product.id)
    setEditingStock(String(product.stock ?? 0))
  }

  const saveEdit = async (productId) => {
    const stock = parseInt(editingStock, 10)
    if (!Number.isInteger(stock) || stock < 0) {
      setError('Stok harus angka minimal 0.')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await warehouseService.updateProductStock(warehouseId, productId, stock)
      setEditingId(null)
      flashNotice('Stok gudang berhasil diperbarui.')
      onUpdated?.()
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui stok gudang.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (productId) => {
    if (!window.confirm('Keluarkan produk ini dari gudang?')) return
    setRemovingId(productId)
    setError(null)
    try {
      await warehouseService.removeProduct(warehouseId, productId)
      flashNotice('Produk dikeluarkan dari gudang.')
      onUpdated?.()
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengeluarkan produk.')
    } finally {
      setRemovingId(null)
    }
  }

  const formatPrice = (value) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Stok Gudang — ${warehouse?.name || ''}`}
      size="lg"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {notice}
        </div>
      )}

      {/* Tambah produk baru */}
      <div className="p-4 bg-slate-50 rounded-2xl mb-5">
        <p className="text-sm font-semibold text-slate-700 mb-3">Tambah Produk ke Gudang</p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_8rem_auto] gap-3 items-end">
          <FormSelect
            label="Produk"
            name="add_product"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            placeholder="Pilih produk"
            options={availableProducts.map((p) => ({ value: p.id, label: p.name }))}
          />
          <Input
            label="Stok Awal"
            name="add_stock"
            type="number"
            min={1}
            placeholder="0"
            value={newStock}
            onChange={(e) => setNewStock(e.target.value)}
          />
          <Button onClick={handleAdd} loading={saving} disabled={!selectedProductId || !newStock}>
            <Plus className="w-4 h-4" />
            Tambah
          </Button>
        </div>
      </div>

      {/* Daftar produk di gudang */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10">
          <PackageX className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-500">Belum ada produk di gudang ini.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl"
            >
              <SafeImage
                src={product.thumbnail}
                alt={product.name}
                className="w-11 h-11 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{product.name}</p>
                <p className="text-xs text-slate-500">
                  {product.category?.name || 'Tanpa kategori'} · {formatPrice(product.price)}
                </p>
              </div>

              {editingId === product.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={editingStock}
                    onChange={(e) => setEditingStock(e.target.value)}
                    className="w-24"
                    aria-label="Stok baru"
                  />
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => saveEdit(product.id)}
                    loading={saving}
                    aria-label="Simpan stok"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} aria-label="Batal">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Badge variant={(product.stock ?? 0) > 10 ? 'success' : (product.stock ?? 0) > 0 ? 'warning' : 'danger'}>
                    Stok: {product.stock ?? 0}
                  </Badge>
                  <Button variant="ghost" size="sm" className="p-2" onClick={() => startEdit(product)} aria-label="Ubah stok">
                    <Pencil className="w-4 h-4" />
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-red-600 hover:bg-red-50"
                onClick={() => handleRemove(product.id)}
                loading={removingId === product.id}
                aria-label={`Keluarkan ${product.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

export default WarehouseProductsModal