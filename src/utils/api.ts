export const apiBaseUrl =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export class ApiRequestError extends Error {
  public readonly status: number
  public readonly details: unknown

  constructor(
    message: string,
    status: number,
    details: unknown,
  ) {
    super(message)
    this.status = status
    this.details = details
  }
}

export async function apiRequest<TResponse>(
  path: string,
  options?: RequestInit,
): Promise<TResponse> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('scanin_token') : null
  const isFormData =
    typeof FormData !== 'undefined' && options?.body instanceof FormData

  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  }) 

  if (!response.ok) {
    let details: unknown = null
    let message = `Backend request failed: ${response.status}`

    try {
      details = await response.clone().json()
      if (
        details &&
        typeof details === 'object' &&
        'message' in details &&
        typeof details.message === 'string'
      ) {
        message = details.message
      }
    } catch {
      const text = await response.text().catch(() => '')
      if (text) message = text
    }

    throw new ApiRequestError(message, response.status, details)
  }

  return (await response.json()) as TResponse
}
