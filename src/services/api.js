import axios from 'axios'

const workspaceStorageKey = 'daymark-workspace-id'

function getWorkspaceId() {
  if (typeof localStorage === 'undefined') return 'local-development-workspace'
  let id = localStorage.getItem(workspaceStorageKey)
  if (!id) {
    id = typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : `workspace-${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(workspaceStorageKey, id)
  }
  return id
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:10000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  config.headers['x-workspace-id'] = getWorkspaceId()
  return config
})

export default api
