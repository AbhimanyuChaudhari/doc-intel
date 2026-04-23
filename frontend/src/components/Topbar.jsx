export default function Topbar({ doc, messageCount }) {
  if (!doc) {
    return (
      <div style={{
        padding: '15px 24px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg2)', display: 'flex', alignItems: 'center'
      }}>
        <div style={{ fontSize: 14, color: 'var(--text3)' }}>Select a document to begin</div>
      </div>
    )
  }

  const stats = [
    { label: 'Pages', value: doc.pages_extracted, color: 'var(--accent2)' },
    { label: 'Chunks', value: doc.chunks_created, color: 'var(--text2)' },
    { label: 'Questions asked', value: messageCount, color: 'var(--text2)' },
  ]

  return (
    <div style={{
      padding: '12px 24px', borderBottom: '1px solid var(--border)',
      background: 'var(--bg2)', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 16, animation: 'fadeIn 0.3s ease'
    }}>
      <style>{`@keyframes fadeIn { from{opacity:0} to{opacity:1} }`}</style>

      {/* Left — doc name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{
          width: 32, height: 32, background: 'rgba(124,111,247,0.12)',
          border: '1px solid rgba(124,111,247,0.25)',
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="1.8">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <path d="M14 2v6h6M9 13h6M9 17h4"/>
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 500, color: 'var(--text)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>
            {doc.filename}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>PDF document</div>
        </div>
      </div>

      {/* Right — stat pills */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {stats.map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '5px 12px', textAlign: 'center'
          }}>
            <div style={{ fontSize: 14, fontWeight: 500, color }}>{value}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{label}</div>
          </div>
        ))}

        {/* Model badge */}
        <div style={{
          background: 'rgba(124,111,247,0.08)', border: '1px solid rgba(124,111,247,0.2)',
          borderRadius: 8, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }}/>
          <div style={{ fontSize: 11, color: 'var(--accent2)', fontWeight: 500 }}>Llama 3.3 70B</div>
        </div>
      </div>
    </div>
  )
}
