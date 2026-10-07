import axios from 'axios'

// Di dev, Vite mem-proxy /api ke backend (lihat vite.config.js) sehingga
// request berjalan same-origin: tidak ada CORS preflight, dan browser
// tidak memblokir lewat local-network-access check.
const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : 'http://localhost:8000/api')

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Saat body berupa FormData (upload foto), HARUS hapus Content-Type
    // yang di-set di default config. Kalau tetap dipaksa 'multipart/form-data'
    // tanpa boundary, PHP/Laravel tidak bisa membaca file yang dikirim.
    // Axios akan membuatkan sendiri header beserta boundary-nya.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance