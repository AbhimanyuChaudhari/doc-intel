import { useState } from 'react'

export default function Sidebar({ docs, activeId, onSelect, onDelete, onUploadClick }) {
  return (
    <div style={{
      width: 260, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh'
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 28, height: 28, background: 'var(--accent)', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <path d="M14 2v6h6M9 13h6M9 17h4"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>DocIntel</span>
        </div>
        <button onClick={onUploadClick} style={{
          width: '100%', padding: '9px 12px', background: 'var(--accent)', border: 'none',
          borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
          Upload PDF
        </button>
      </div>

      {/* Docs list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
        <div style={{
          fontSize: 11, fontWeight: 500, color: 'var(--text3)',
          textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 8px 6px'
        }}>Documents</div>

        {docs.length === 0 && (
          <div style={{ padding: '24px 8px', textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>
            No documents yet
          </div>
        )}

        {docs.map(doc => (
          <DocItem
            key={doc.doc_id}
            doc={doc}
            active={doc.doc_id === activeId}
            onSelect={() => onSelect(doc)}
            onDelete={(e) => { e.stopPropagation(); onDelete(doc.doc_id) }}
          />
        ))}
      </div>
    </div>
  )
}

function DocItem({ doc, active, onSelect, onDelete }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 2,
        background: active || hovered ? 'var(--bg3)' : 'transparent',
        border: `1px solid ${active ? 'var(--border2)' : 'transparent'}`,
        transition: 'all 0.12s'
      }}
    >
      <div style={{
        fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap',
        overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3
      }}>
        {doc.filename.replace('.pdf', '')}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', gap: 8 }}>
        <span>{doc.pages_extracted} pages</span>
        <span>{doc.chunks_created} chunks</span>
        <span
          onClick={onDelete}
          style={{
            marginLeft: 'auto', color: 'var(--red)', opacity: hovered ? 1 : 0,
            transition: 'opacity 0.12s', cursor: 'pointer'
          }}
        >remove</span>
      </div>
    </div>
  )
}
