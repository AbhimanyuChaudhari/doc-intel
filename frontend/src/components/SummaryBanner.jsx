export default function SummaryBanner({ summary }) {
  if (!summary) return null
  return (
    <div style={{
      margin: '0 24px 12px',
      background: 'var(--bg3)',
      border: '1px solid var(--border2)',
      borderRadius: 8,
      padding: '10px 14px',
    }}>
      <div style={{ fontSize: 11, color: 'var(--accent2)', fontWeight: 500, marginBottom: 4 }}>
        Document summary
      </div>
      <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
        {summary}
      </div>
    </div>
  )
}
