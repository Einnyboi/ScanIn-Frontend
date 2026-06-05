import { apiRequest } from '../utils/api'

type ApiResponse<T> = {
  data: T
}

const requestWithData = async <T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> => {
  const token = localStorage.getItem('scanin_token')
  const response = await apiRequest<T>(path, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  return { data: response }
}

const api = {
  get: <T>(path: string) => requestWithData<T>(path),
  post: <T>(path: string, body?: unknown) =>
    requestWithData<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: <T>(path: string, body?: unknown) =>
    requestWithData<T>(path, {
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: <T>(path: string) =>
    requestWithData<T>(path, {
      method: 'DELETE',
    }),
}

export default api
