import axiosInstance from './axiosInstance'

export const merchantService = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/merchants', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/merchants/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await axiosInstance.post('/merchants', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/merchants/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/merchants/${id}`)
    return response.data
  },

  // Merchant milik user yang sedang login (untuk role keeper).
  // Keeper TIDAK punya akses ke GET /merchants (manager-only).
  getMyMerchant: async () => {
    const response = await axiosInstance.get('/my-merchant')
    return response.data
  },

  getProducts: async (id, params = {}) => {
    const response = await axiosInstance.get(`/merchants/${id}/products`, { params })
    return response.data
  },

  // Distribusi stok dari gudang ke merchant. Backend mengurasi stok gudang
  // secara otomatis di dalam satu transaksi database.
  assignProduct: async (merchantId, payload) => {
    const response = await axiosInstance.post(`/merchants/${merchantId}/products`, payload)
    return response.data
  },

  updateProductStock: async (merchantId, productId, payload) => {
    const response = await axiosInstance.put(`/merchants/${merchantId}/products/${productId}`, payload)
    return response.data
  },

  removeProduct: async (merchantId, productId) => {
    const response = await axiosInstance.delete(`/merchants/${merchantId}/products/${productId}`)
    return response.data
  },
}