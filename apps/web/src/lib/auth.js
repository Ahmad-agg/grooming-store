import { apiFetch } from './api'

export async function logout() {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' })
  } catch (e) {
    console.error('Logout failed', e)
  }
}
