import axiosInstance from './axiosInstance'

export const categoryService = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/categories', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/categories/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await axiosInstance.post('/categories', data)
    return response.data
  },

  update: async (id, data) => {
    // Tambahkan spoofing method agar Laravel membaca FormData
    if (data instanceof FormData) {
        data.append('_method', 'PUT')
    }
    const response = await axiosInstance.post(`/categories/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/categories/${id}`)
    return response.data
  },
}