import axiosInstance from './axiosInstance'

export const authService = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/login', credentials)
    const data = response.data

    // Handle different Laravel response structures
    const token = data.access_token || data.token || data.data?.access_token || data.data?.token
    const user = data.user || data.data?.user

    return { token, user, ...data }
  },

  logout: async () => {
    const response = await axiosInstance.post('/logout')
    return response.data
  },

  getUser: async () => {
    const response = await axiosInstance.get('/user')
    return { user: response.data.user || response.data.data?.user || response.data }
  },
}