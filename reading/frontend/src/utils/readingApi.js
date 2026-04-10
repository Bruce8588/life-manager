const API_BASE = '/api/reading'

async function request(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(API_BASE + path, opts)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const readingApi = {
  // Books
  getBooks: () => request('GET', '/books'),
  createBook: (book) => request('POST', '/books', book),
  updateBook: (id, book) => request('PUT', `/books/${id}`, book),
  deleteBook: (id) => request('DELETE', `/books/${id}`),

  // Notes
  getNotes: (bookId) => request('GET', `/notes?book_id=${encodeURIComponent(bookId)}`),
  createNote: (bookId, content) => request('POST', '/notes', { book_id: bookId, content }),
  updateNote: (id, content) => request('PUT', `/notes/${id}`, { content }),
  deleteNote: (id) => request('DELETE', `/notes/${id}`),

  // Summaries
  getSummaries: (bookId) => request('GET', `/summaries?book_id=${encodeURIComponent(bookId)}`),
  createSummary: (bookId, title, content) => request('POST', '/summaries', { book_id: bookId, title, content }),
  updateSummary: (id, data) => request('PUT', `/summaries/${id}`, data),
  deleteSummary: (id) => request('DELETE', `/summaries/${id}`),

  // Mind Maps
  getMindMap: (bookId) => request('GET', `/mindmaps?book_id=${encodeURIComponent(bookId)}`),
  saveMindMap: (bookId, nodes) => request('POST', '/mindmaps', { book_id: bookId, nodes }),
}
