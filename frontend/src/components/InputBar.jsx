import { useState } from 'react'

export default function InputBar({ onSend, disabled }) {
  const [value, setValue] = useState('')

  function handleSend() {
    if (!value.trim() || disabled) return
    onSend(value.trim())
    setValue('')
  }

  return (
    <div style={{ padding: '14px 24px 18px', borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center',
        background: 'var(--bg3)', border: '1px solid var(--border2)',
        borderRadius: 12, padding: '0 14px',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onBlur={e => e.currentTarget.style.borderColor = 'var(--border2)'}
      >
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={disabled}
          placeholder={disabled ? 'Select a document to start asking...' : 'Ask anything about this document...'}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'var(--text)', fontSize: 13, padding: '12px 0',
            fontFamily: 'inherit'
          }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          style={{
            width: 32, height: 32, background: disabled || !value.trim() ? 'var(--bg4)' : 'var(--accent)',
            border: 'none', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s', flexShrink: 0
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
