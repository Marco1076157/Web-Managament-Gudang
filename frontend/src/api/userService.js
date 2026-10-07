import axiosInstance from './axiosInstance'

export const userService = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/users', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/users/${id}`)
    return response.data
  },

  create: async (data) => {
    const config = data instanceof FormData ? {} : undefined
    const response = await axiosInstance.post('/users', data, config)
    return response.data
  },

  update: async (id, data) => {
    const config = data instanceof FormData ? {} : undefined
    const response = await axiosInstance.post(`/users/${id}`, data, config)
    return response.data
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/users/${id}`)
    return response.data
  },

  // Backend: PUT /api/users/{user}/role  (body: { role_id })
  assignRole: async (userId, roleId) => {
    const response = await axiosInstance.put(`/users/${userId}/role`, { role_id: roleId })
    return response.data
  },
}