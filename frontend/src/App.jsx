import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import InputBar from './components/InputBar'
import SummaryBanner from './components/SummaryBanner'
import UploadModal from './components/UploadModal'
import Topbar from './components/Topbar'
import { uploadDoc, askQuestion, deleteDoc } from './hooks/useApi'

export default function App() {
  const [docs, setDocs]             = useState([])
  const [activeDoc, setActiveDoc]   = useState(null)
  const [chats, setChats]           = useState({})
  const [summaries, setSummaries]   = useState({})
  const [loading, setLoading]       = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [status, setStatus]         = useState('API running at localhost:8000')

  const messages = activeDoc ? (chats[activeDoc.doc_id] || []) : []
  const summary  = activeDoc ? summaries[activeDoc.doc_id] : null
  const questionCount = messages.filter(m => m.role === 'user').length

  async function handleUpload(file) {
    const doc = await uploadDoc(file)
    setDocs(prev => [...prev, doc])
    setChats(prev => ({ ...prev, [doc.doc_id]: [] }))
    setShowUpload(false)
    setActiveDoc(doc)
    setStatus(`Uploaded: ${doc.filename}`)
    autoSummarize(doc)
  }

  async function autoSummarize(doc) {
    setStatus('Generating summary...')
    try {
      const res = await askQuestion(doc.doc_id, 'Give me a 2-3 sentence summary of this document.')
      setSummaries(prev => ({ ...prev, [doc.doc_id]: res.answer }))
      setStatus(`Ready — ${doc.filename}`)
    } catch {
      setStatus(`Ready — ${doc.filename}`)
    }
  }

  async function handleSend(question) {
    if (!activeDoc) return
    const docId = activeDoc.doc_id

    setChats(prev => ({
      ...prev,
      [docId]: [...(prev[docId] || []), { role: 'user', content: question }]
    }))
    setLoading(true)

    try {
      const res = await askQuestion(docId, question)
      setChats(prev => ({
        ...prev,
        [docId]: [...(prev[docId] || []), {
          role: 'assistant',
          content: res.answer,
          sources: res.sources,
          source_chunks: res.source_chunks || []
        }]
      }))
    } catch (e) {
      setChats(prev => ({
        ...prev,
        [docId]: [...(prev[docId] || []), {
          role: 'assistant',
          content: `Error: ${e.message}`,
          sources: [], source_chunks: []
        }]
      }))
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(docId) {
    try { await deleteDoc(docId) } catch {}
    setDocs(prev => prev.filter(d => d.doc_id !== docId))
    if (activeDoc?.doc_id === docId) setActiveDoc(null)
    setStatus('Document removed')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', animation: 'appFadeIn 0.4s ease' }}>
      <style>{`@keyframes appFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }`}</style>

      <Sidebar
        docs={docs}
        activeId={activeDoc?.doc_id}
        onSelect={setActiveDoc}
        onDelete={handleDelete}
        onUploadClick={() => setShowUpload(true)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar doc={activeDoc} messageCount={questionCount} />

        <ChatArea
          messages={messages}
          loading={loading}
          onSuggestion={q => handleSend(q)}
        />

        <SummaryBanner summary={summary} />
        <InputBar onSend={handleSend} disabled={!activeDoc || loading} />

        {/* Status bar */}
        <div style={{
          padding: '7px 24px', borderTop: '1px solid var(--border)',
          background: 'var(--bg2)', fontSize: 11, color: 'var(--text3)',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }}/>
          {status}
        </div>
      </div>

      {showUpload && (
        <UploadModal onUpload={handleUpload} onClose={() => setShowUpload(false)} />
      )}
    </div>
  )
}
