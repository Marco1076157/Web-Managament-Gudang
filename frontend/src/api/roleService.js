import axiosInstance from './axiosInstance'

export const roleService = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/roles', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/roles/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await axiosInstance.post('/roles', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/roles/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/roles/${id}`)
    return response.data
  },

  getPermissions: async (id) => {
    const response = await axiosInstance.get(`/roles/${id}/permissions`)
    return response.data
  },

  assignPermissions: async (id, permissions) => {
    const response = await axiosInstance.post(`/roles/${id}/permissions`, { permissions })
    return response.data
  },
}