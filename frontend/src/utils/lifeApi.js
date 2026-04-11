const API_BASE = '/api/life'

async function request(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(API_BASE + path, opts)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const lifeApi = {
  // Projects
  getProjects: () => request('GET', '/projects'),
  saveProjects: (projects) => request('POST', '/projects', projects),
  reorderProjects: (ids) => request('PUT', '/projects/reorder', ids),

  // Project Notes
  getAllNotes: () => request('GET', '/notes'),
  getNotes: (projectId) => request('GET', `/notes?project_id=${encodeURIComponent(projectId)}`),
  createNote: (projectId, text) => request('POST', '/notes', { project_id: projectId, text }),
  updateNote: (id, text) => request('PUT', `/notes/${id}`, { text }),
  deleteNote: (id) => request('DELETE', `/notes/${id}`),

  // Psychology Hearts
  getHearts: () => request('GET', '/hearts'),
  createHeart: (data) => request('POST', '/hearts', data),
  updateHeart: (id, data) => request('PUT', `/hearts/${id}`, data),
  deleteHeart: (id) => request('DELETE', `/hearts/${id}`),

  // Psychology Tools
  getTools: () => request('GET', '/tools'),
  createTool: (data) => request('POST', '/tools', data),
  updateTool: (id, data) => request('PUT', `/tools/${id}`, data),
  deleteTool: (id) => request('DELETE', `/tools/${id}`),
}
