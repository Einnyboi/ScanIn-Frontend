import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  withCredentials: true,
})

// Inject JWT token otomatis ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('scanin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — token expired, redirect ke login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('scanin_token')
      localStorage.removeItem('scanin_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
