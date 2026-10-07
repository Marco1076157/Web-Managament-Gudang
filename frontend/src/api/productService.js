import axiosInstance from './axiosInstance'

export const productService = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/products', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/products/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await axiosInstance.post('/products', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/products/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/products/${id}`)
    return response.data
  },
}