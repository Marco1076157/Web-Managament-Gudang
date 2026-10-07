import axiosInstance from './axiosInstance'

export const warehouseService = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/warehouses', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/warehouses/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await axiosInstance.post('/warehouses', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/warehouses/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/warehouses/${id}`)
    return response.data
  },

  getProducts: async (id, params = {}) => {
    const response = await axiosInstance.get(`/warehouses/${id}/products`, { params })
    return response.data
  },

  // Tambah produk ke gudang beserta stok awal.
  attachProduct: async (warehouseId, productId, stock) => {
    const response = await axiosInstance.post(`/warehouses/${warehouseId}/products`, {
      product_id: productId,
      stock,
    })
    return response.data
  },

  // Ubah stok produk di gudang.
  updateProductStock: async (warehouseId, productId, stock) => {
    const response = await axiosInstance.put(`/warehouses/${warehouseId}/products/${productId}`, {
      stock,
    })
    return response.data
  },

  removeProduct: async (warehouseId, productId) => {
    const response = await axiosInstance.delete(`/warehouses/${warehouseId}/products/${productId}`)
    return response.data
  },
}