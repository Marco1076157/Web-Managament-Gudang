import axiosInstance from './axiosInstance'

export const transactionService = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/transactions', { params })
    return response.data
  },

  // Aggregate untuk stat cards dashboard (ringan, 2 query)
  getSummary: async () => {
    const response = await axiosInstance.get('/transactions/summary')
    return response.data
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/transactions/${id}`)
    return response.data
  },

  // POS checkout (route: POST /transactions, sesuai PRD/ALUR backend).
  checkout: async (data) => {
    const response = await axiosInstance.post('/transactions', data)
    return response.data
  },

  // Riwayat transaksi untuk merchant milik keeper yang sedang login.
  // Backend menentukan merchant dari user, jadi tidak perlu merchant_id.
  getMerchantTransactions: async (params = {}) => {
    const response = await axiosInstance.get('/my-merchant/transactions', { params })
    return response.data
  },
}