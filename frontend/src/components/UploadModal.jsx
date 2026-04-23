import { useState, useRef } from 'react'

export default function UploadModal({ onUpload, onClose }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef()

  async function handleFile(file) {
    if (!file?.name.endsWith('.pdf')) { setError('Only PDF files are supported.'); return }
    setError(''); setUploading(true)
    try { await onUpload(file) }
    catch (e) { setError(e.message); setUploading(false) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
    }}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 14, padding: 32, width: 360, textAlign: 'center'
      }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
          Upload a document
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
          PDF files only. Indexed and ready to query in seconds.
        </div>

        <div
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
          style={{
            border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border2)'}`,
            borderRadius: 10, padding: '32px 24px', cursor: 'pointer',
            marginBottom: 16, transition: 'border-color 0.15s'
          }}
        >
          {uploading ? (
            <div style={{ color: 'var(--text2)', fontSize: 13 }}>
              <div style={{ marginBottom: 10 }}>
                <Spinner />
              </div>
              Uploading and indexing...
            </div>
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text3)"
                strokeWidth="1.5" style={{ marginBottom: 10 }}>
                <path d="M12 3v12M7 8l5-5 5 5M5 17v2a2 2 0 002 2h10a2 2 0 002-2v-2"/>
              </svg>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>Drop your PDF here or click to browse</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Max 20MB</div>
            </>
          )}
        </div>

        <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])} />

        {error && (
          <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{error}</div>
        )}

        <button onClick={onClose} style={{
          background: 'none', border: '1px solid var(--border2)', color: 'var(--text2)',
          padding: '8px 24px', borderRadius: 8, fontSize: 13, cursor: 'pointer'
        }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'inline-flex', gap: 5 }}>
      {[0, 0.2, 0.4].map((delay, i) => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
          animation: `pulse 1.2s ease-in-out ${delay}s infinite`
        }}/>
      ))}
      <style>{`@keyframes pulse{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}
