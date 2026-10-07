import { useCallback, useEffect, useState } from 'react'
import { PackageX, Plus, Pencil, Trash2, Save, X, CheckCircle2 } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'
import Input from './Input'
import FormSelect from './form/FormSelect'
import Badge from './Badge'
import SafeImage from './SafeImage'
import { merchantService, warehouseService } from '../api'

/**
 * Modal "Distribusi Stok" untuk sebuah merchant.
 * Manager memilih gudang asal → produk → jumlah stok yang didistribusikan.
 * Stok gudang otomatis berkurang di backend.
 */
const MerchantProductsModal = ({ isOpen, onClose, merchant, onUpdated }) => {
  const merchantId = merchant?.id

  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('')
  const [warehouseProducts, setWarehouseProducts] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [distributeStock, setDistributeStock] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingStock, setEditingStock] = useState('')
  const [removingId, setRemovingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  const warehouseName = (id) => warehouses.find((w) => w.id === id)?.name || 'Gudang'

  const load = useCallback(async () => {
    if (!merchantId) return
    try {
      setLoading(true)
      setError(null)
      const [productsRes, warehousesRes] = await Promise.all([
        merchantService.getProducts(merchantId, { per_page: 100 }),
        warehouseService.getAll({ per_page: 100 }),
      ])
      setProducts(productsRes.data || [])
      setWarehouses(warehousesRes.data || [])
    } catch (err) {
      console.error('Load merchant products error:', err)
      setError('Gagal memuat stok merchant.')
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  useEffect(() => {
    if (isOpen && merchantId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      load()
    }
  }, [isOpen, merchantId, load])

  // Saat gudang dipilih, ambil produk (beserta stok) yang ada di gudang tsb.
  const loadWarehouseProducts = useCallback(async () => {
    if (!selectedWarehouseId) {
      setWarehouseProducts([])
      setSelectedProductId('')
      return
    }
    try {
      const res = await warehouseService.getProducts(selectedWarehouseId, { per_page: 100 })
      setWarehouseProducts(res.data || [])
      setSelectedProductId('')
      setDistributeStock('')
    } catch (err) {
      console.error('Load warehouse products error:', err)
      setWarehouseProducts([])
    }
  }, [selectedWarehouseId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWarehouseProducts()
  }, [selectedWarehouseId, loadWarehouseProducts])

  const selectedProduct = warehouseProducts.find((p) => String(p.id) === String(selectedProductId))

  const flashNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(null), 2500)
  }

  const handleDistribute = async () => {
    if (!selectedWarehouseId) {
      setError('Pilih gudang asal terlebih dahulu.')
      return
    }
    if (!selectedProductId || !selectedProduct) {
      setError('Pilih produk yang akan didistribusikan.')
      return
    }
    const stock = parseInt(distributeStock, 10)
    if (!Number.isInteger(stock) || stock < 1) {
      setError('Jumlah stok harus angka minimal 1.')
      return
    }
    if ((selectedProduct.stock ?? 0) < stock) {
      setError(`Stok di gudang tersisa ${selectedProduct.stock}, tidak cukup untuk ${stock}.`)
      return
    }
    setError(null)
    setSaving(true)
    try {
      await merchantService.assignProduct(merchantId, {
        warehouse_id: Number(selectedWarehouseId),
        product_id: Number(selectedProductId),
        stock,
      })
      setSelectedProductId('')
      setDistributeStock('')
      flashNotice('Stok berhasil didistribusikan ke merchant.')
      onUpdated?.()
      await Promise.all([load(), loadWarehouseProducts()])
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mendistribusikan stok.')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (product) => {
    setEditingId(product.id)
    setEditingStock(String(product.stock ?? 0))
  }

  const saveEdit = async (product) => {
    const stock = parseInt(editingStock, 10)
    if (!Number.isInteger(stock) || stock < 0) {
      setError('Stok harus angka minimal 0.')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await merchantService.updateProductStock(merchantId, product.id, {
        stock,
        warehouse_id: product.warehouse_id,
      })
      setEditingId(null)
      flashNotice('Stok merchant berhasil diperbarui.')
      onUpdated?.()
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui stok merchant.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (productId) => {
    if (!window.confirm('Hentikan distribusi produk ini dari merchant?')) return
    setRemovingId(productId)
    setError(null)
    try {
      await merchantService.removeProduct(merchantId, productId)
      flashNotice('Produk dikeluarkan dari merchant.')
      onUpdated?.()
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengeluarkan produk.')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Distribusi Stok — ${merchant?.name || ''}`}
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

      {/* Distribusi stok dari gudang */}
      <div className="p-4 bg-slate-50 rounded-2xl mb-5">
        <p className="text-sm font-semibold text-slate-700 mb-3">Kirim Stok dari Gudang</p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr] gap-3">
          <FormSelect
            label="Gudang Asal"
            name="source_warehouse"
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            placeholder="Pilih gudang"
            options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_8rem_auto] gap-3 items-end mt-3">
          <FormSelect
            label="Produk"
            name="distribute_product"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            placeholder={selectedWarehouseId ? 'Pilih produk' : 'Pilih gudang dahulu'}
            options={warehouseProducts.map((p) => ({
              value: p.id,
              label: `${p.name} (stok gudang: ${p.stock ?? 0})`,
            }))}
            disabled={!selectedWarehouseId}
          />
          <Input
            label="Jumlah"
            name="distribute_stock"
            type="number"
            min={1}
            placeholder="0"
            value={distributeStock}
            onChange={(e) => setDistributeStock(e.target.value)}
          />
          <Button onClick={handleDistribute} loading={saving} disabled={!selectedProductId || !distributeStock}>
            <Plus className="w-4 h-4" />
            Kirim
          </Button>
        </div>
      </div>

      {/* Stok yang sudah ada di merchant */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10">
          <PackageX className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-500">Belum ada produk di merchant ini.</p>
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
                  {product.category?.name || 'Tanpa kategori'} · {warehouseName(product.warehouse_id)}
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
                    onClick={() => saveEdit(product)}
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

export default MerchantProductsModal