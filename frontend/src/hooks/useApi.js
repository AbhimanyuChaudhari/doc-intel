const BASE = '/api'

export async function uploadDoc(file) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: fd })
  if (!res.ok) throw new Error((await res.json()).detail || 'Upload failed')
  return res.json()
}

export async function askQuestion(docId, question) {
  const res = await fetch(`${BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc_id: docId, question })
  })
  if (!res.ok) throw new Error((await res.json()).detail || 'Request failed')
  return res.json()
}

export async function deleteDoc(docId) {
  await fetch(`${BASE}/document/${docId}`, { method: 'DELETE' })
}

export async function listDocs() {
  const res = await fetch(`${BASE}/documents`)
  return res.json()
}
