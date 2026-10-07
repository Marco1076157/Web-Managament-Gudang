import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  User,
  Phone,
  Package,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  ReceiptText,
  Store,
  X,
} from 'lucide-react'
import { transactionService } from '../../api'
import { queryKeys } from '../../hooks/queryKeys'
import { useMyMerchant, useMerchantProducts } from '../../hooks/useCachedData'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Badge from '../../components/Badge'
import Modal from '../../components/Modal'

const POSTransaction = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)
  const [cart, setCart] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successModal, setSuccessModal] = useState(false)
  const [lastTransaction, setLastTransaction] = useState(null)

  // Data toko + produk di-cache (SWR): saat kembali ke /transactions/create
  // dari menu lain, wizard langsung tampil tanpa skeleton loader.
  const merchantQuery = useMyMerchant()
  const merchant = merchantQuery.data ?? null
  const productsQuery = useMerchantProducts(merchant?.id)
  const products = productsQuery.data?.items ?? []
  const loading = merchantQuery.isPending
  const loadError =
    merchantQuery.isError || productsQuery.isError
      ? 'Gagal memuat data toko dan produk'
      : null


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax
  // Ringkasan Step 3: jumlah jenis produk & total kuantitas item.
  const totalJenis = cart.length
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0)

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        if (existing.quantity >= (product.stock || 0)) return prev
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId, change) => {
    setCart(prev => {
      const item = prev.find(i => i.id === productId)
      if (!item) return prev
      const newQty = item.quantity + change
      if (newQty <= 0) return prev.filter(i => i.id !== productId)
      if (newQty > (item.stock || 0)) return prev
      return prev.map(i => i.id === productId ? { ...i, quantity: newQty } : i)
    })
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const validateStep1 = () => {
    if (!customerName.trim()) {
      setError('Nama customer wajib diisi')
      return false
    }
    if (!customerPhone.trim()) {
      setError('Nomor telepon wajib diisi')
      return false
    }
    setError(null)
    return true
  }

  const validateStep2 = () => {
    if (cart.length === 0) {
      setError('Keranjang kosong, silakan pilih produk')
      return false
    }
    setError(null)
    return true
  }

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2)
    } else if (step === 2) {
      if (validateStep2()) setStep(3)
    }
  }

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return

    setSubmitting(true)
    setError(null)

    try {
      const items = cart.map(item => ({
        product_id: item.id,
        qty: item.quantity,
      }))

      const response = await transactionService.checkout({
        merchant_id: merchant.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        items,
      })

      setLastTransaction(response.data)
      setSuccessModal(true)
      setCart([])
      setCustomerName('')
      setCustomerPhone('')
      setStep(1)

      // Transaksi baru + stok produk berubah -> buang cache terkait supaya
      // daftar transaksi, ringkasan dashboard, dan stok langsung direfresh
      // di background (data lama tetap tampil sampai data baru masuk).
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions })
      await queryClient.invalidateQueries({ queryKey: queryKeys.products })
    } catch (err) {
      console.error('Checkout error:', err)
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Stok tidak mencukupi untuk salah satu produk')
      } else {
        setError('Gagal memproses transaksi')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const steps = [
    { number: 1, label: 'Step 1 (Customer Detail): Customer Name & Phone Number', icon: User },
    { number: 2, label: 'Step 2 (Assign Products): Pilih produk & jumlah', icon: Package },
    { number: 3, label: 'Step 3 (Review Transaction): Ringkasan & Konfirmasi', icon: CreditCard },
  ]

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-6" />
          <div className="space-y-4">
            <div className="h-10 bg-slate-200 rounded" />
            <div className="h-10 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!merchant) {
    if (loadError) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Gagal memuat data</h2>
            <p className="text-slate-500">{loadError}</p>
            <Button variant="secondary" className="mt-6" onClick={() => navigate('/transactions')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Transaksi
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-12 text-center">
          <Store className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Belum ditugaskan ke merchant</h2>
          <p className="text-slate-500">Silakan hubungi admin untuk mendapatkan akses ke toko</p>
          <Button variant="secondary" className="mt-6" onClick={() => navigate('/transactions')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Transaksi
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">POS Kasir</h1>
          <p className="text-slate-500 mt-1">Toko: {merchant.name}</p>
        </div>

        {/* Kembali ke daftar transaksi tanpa membuang isian wizard. */}
        <Button
          variant="secondary"
          size="md"
          onClick={() => navigate('/transactions')}
          className="shrink-0"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Kembali
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-4">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                index + 1 < step
                  ? 'bg-green-500 text-white'
                  : index + 1 === step
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-400'
              }`}>
                {index + 1 < step ? <CheckCircle className="w-5 h-5" /> : s.number}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-20 h-1 mx-2 ${index + 1 < step ? 'bg-green-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          {steps.map((s, index) => (
            <div key={s.number} className={`text-center w-1/3 ${index === 1 ? 'mx-auto' : index === 2 ? 'text-right' : ''}`}>
              <p className={`text-sm font-medium ${index + 1 === step ? 'text-blue-600' : 'text-slate-500'}`}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {(error || loadError) && (
        <div className="p-4 bg-red-100 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error || loadError}</span>
          {error && (
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto p-1">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Detail Customer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
            <Input
              label="Nama Customer"
              name="customer_name"
              placeholder="Masukkan nama customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              leftIcon={<User className="w-5 h-5" />}
              required
              autoFocus
            />
            <Input
              label="Nomor Telepon"
              name="customer_phone"
              placeholder="08xxxxxxxxxx"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              leftIcon={<Phone className="w-5 h-5" />}
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => navigate('/transactions')}>
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Kembali
            </Button>
            <Button variant="primary" onClick={handleNext} size="lg">
              Lanjutkan
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Pilih Produk</h2>
              {productsQuery.isPending ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-500">Tidak ada produk tersedia</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map(product => (
                    <div
                      key={product.id}
                      className={`p-4 rounded-xl border-2 transition-colors ${
                        cart.some(item => item.id === product.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-500">{product.category?.name || 'Tanpa kategori'}</p>
                          <p className="text-lg font-bold text-blue-600 mt-1">{formatCurrency(product.price)}</p>
                        </div>
                        <Badge variant={(product.stock || 0) > 10 ? 'success' : (product.stock || 0) > 0 ? 'warning' : 'danger'}>
                          Stok: {product.stock || 0}
                        </Badge>
                      </div>
                      {cart.some(item => item.id === product.id) ? (
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="p-1" onClick={() => updateQuantity(product.id, -1)} disabled={(cart.find(i => i.id === product.id)?.quantity || 0) <= 1}>
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-bold text-slate-900">
                              {cart.find(i => i.id === product.id)?.quantity}
                            </span>
                            <Button variant="ghost" size="sm" className="p-1" onClick={() => updateQuantity(product.id, 1)} disabled={(cart.find(i => i.id === product.id)?.quantity || 0) >= (product.stock || 0)}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFromCart(product.id)} className="text-red-600 hover:text-red-700 p-1">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="w-full mt-4"
                          onClick={() => addToCart(product)}
                          disabled={(product.stock || 0) <= 0}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Tambah ke Keranjang
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center justify-between">
                Keranjang
                {cart.length > 0 && (
                  <Badge variant="primary">{cart.reduce((sum, item) => sum + item.quantity, 0)} item</Badge>
                )}
              </h2>
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Package className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <p>Keranjang kosong</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{item.name}</p>
                          <p className="text-sm text-slate-500">{formatCurrency(item.price)} x {item.quantity}</p>
                        </div>
                        <p className="font-bold text-slate-900 whitespace-nowrap">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="text-slate-900">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">PPN (10%)</span>
                      <span className="text-slate-900">{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
                      <span className="text-slate-900">Total</span>
                      <span className="text-blue-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </>
              )}
              {/* Kembali & Lanjutkan bersebelahan agar mudah dijangkau. */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button variant="secondary" onClick={handlePrev}>
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Kembali
                </Button>
                <Button onClick={handleNext} disabled={cart.length === 0} size="lg">
                  Lanjutkan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Ringkasan Transaksi</h2>

          <div className="space-y-4 mb-6">
            {/* Grid 2 kolom (icon + konten) dengan lebar kolom icon tetap,
                sehingga baris Customer & Telepon persis sejajar vertikal. */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="grid grid-cols-[2.5rem_1fr] items-center gap-x-3 gap-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-500">Customer</p>
                  <p className="font-medium text-slate-900 truncate">{customerName}</p>
                </div>

                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-500">Telepon</p>
                  <p className="font-medium text-slate-900 truncate">{customerPhone}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-3">Toko: {merchant.name}</p>

              {/* Ringkasan jumlah jenis item & total kuantitas. */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200">
                  <Package className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-[11px] leading-none text-slate-500">Total Item</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1 truncate">
                      {totalJenis} Jenis Produk
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200">
                  <ShoppingCart className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-[11px] leading-none text-slate-500">Total Qty</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1 truncate">
                      {totalQty} Pcs
                    </p>
                  </div>
                </div>
              </div>

              {/* Daftar ringkasan produk: nama, harga satuan, qty, subtotal. */}
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-200 last:border-0">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{item.name}</p>
                      <p className="text-sm text-slate-500">
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">PPN (10%)</span>
                <span className="text-slate-900">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t border-slate-200 pt-2">
                <span className="text-slate-900">Grand Total</span>
                <span className="text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Kembali ke Step 2 (state keranjang tetap) bersebelahan
              dengan tombol konfirmasi. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="secondary" onClick={handlePrev}>
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Kembali
            </Button>
            <Button onClick={handleSubmit} loading={submitting} size="lg">
              <ReceiptText className="w-4 h-4" aria-hidden="true" />
              Bayar &amp; Simpan Transaksi
            </Button>
          </div>
        </div>
      )}

      <Modal
        isOpen={successModal}
        onClose={() => setSuccessModal(false)}
        title="Transaksi Berhasil"
        size="md"
        showCloseButton={false}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Your Transaction Has Been Successfully Created</h3>
          {lastTransaction && (
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-left">
              <p className="text-sm text-slate-500">Kode Transaksi: <span className="font-medium text-slate-900">{lastTransaction.transaction_code}</span></p>
              <p className="text-sm text-slate-500">Customer: <span className="font-medium text-slate-900">{lastTransaction.customer_name}</span></p>
              <p className="text-sm text-slate-500">Total: <span className="font-bold text-blue-600">{formatCurrency(lastTransaction.total_amount)}</span></p>
            </div>
          )}
          <div className="flex flex-col gap-3 pt-2">
            <Button variant="success" className="w-full" onClick={() => window.print()}>
              <ReceiptText className="w-4 h-4 mr-2" />
              Cetak Struk
            </Button>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => { setSuccessModal(false); navigate('/transactions'); }}>
                View Details
              </Button>
              <Button variant="primary" className="flex-1" onClick={() => setSuccessModal(false)}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Back to Transaction
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Area struk yang hanya muncul saat mencetak */}
      {lastTransaction && (
        <div className="print-area">
          <div className="max-w-sm mx-auto pt-8 font-mono text-sm">
            <div className="text-center mb-6">
              <h1 className="text-lg font-bold">{merchant.name}</h1>
              <p className="text-xs">MONDAY POS</p>
              <p className="text-xs">{new Date(lastTransaction.created_at).toLocaleString('id-ID')}</p>
              <p className="text-xs mt-2">{lastTransaction.transaction_code}</p>
            </div>
            <p className="mb-4">
              Customer: <strong>{lastTransaction.customer_name}</strong>
              {lastTransaction.customer_phone && <br />}
              {lastTransaction.customer_phone && `Telepon: ${lastTransaction.customer_phone}`}
            </p>
            <div className="border-t border-b border-slate-900 py-2 my-4">
              {(lastTransaction.items || []).map((item) => (
                <div key={item.id || item.product_id} className="flex justify-between gap-3 py-0.5">
                  <span>
                    {item.product?.name || item.name || `Produk #${item.product_id}`}
                    <span className="text-xs"> x {item.qty}</span>
                  </span>
                  <span>{formatCurrency(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(lastTransaction.total_amount - lastTransaction.tax_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>PPN (10%)</span>
                <span>{formatCurrency(lastTransaction.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-slate-900 pt-1 mt-1">
                <span>Total</span>
                <span>{formatCurrency(lastTransaction.total_amount)}</span>
              </div>
            </div>
            <div className="text-center mt-8 text-xs">
              Terima kasih sudah berbelanja
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default POSTransaction