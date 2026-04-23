import { useEffect, useRef, useState } from 'react'

const SUGGESTIONS = [
  'Summarize this document',
  'What are the key findings?',
  'What are the main risks?',
  'List all recommendations',
]

export default function ChatArea({ messages, loading, onSuggestion }) {
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  if (messages.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        padding: '40px 24px',
        animation: 'fadeUp 0.4s ease'
      }}>
        <style>{`
          @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
          @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
          @keyframes slideIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
          @keyframes pulse { 0%,80%,100%{opacity:.3;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
          @keyframes spin { to { transform: rotate(360deg) } }
        `}</style>
        <div style={{
          width: 56, height: 56, background: 'var(--bg3)', borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--border2)'
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <path d="M14 2v6h6M9 13h6M9 17h4"/>
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
            Ready to answer
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>
            Ask anything — you'll get answers with exact page citations.
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4 }}>
          {SUGGESTIONS.map((s, i) => (
            <button key={s} onClick={() => onSuggestion(s)} style={{
              background: 'var(--bg3)', border: '1px solid var(--border2)',
              borderRadius: 20, padding: '7px 16px', fontSize: 12, color: 'var(--text2)',
              cursor: 'pointer', transition: 'all 0.15s',
              animation: `fadeUp 0.4s ease ${i * 0.07}s both`
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.color = 'var(--accent2)'
              e.currentTarget.style.background = 'rgba(124,111,247,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border2)'
              e.currentTarget.style.color = 'var(--text2)'
              e.currentTarget.style.background = 'var(--bg3)'
            }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,80%,100%{opacity:.3;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
        @keyframes copyPop { 0%{transform:scale(1)} 50%{transform:scale(1.2)} 100%{transform:scale(1)} }
      `}</style>
      {messages.map((msg, i) => (
        <Message key={i} msg={msg} index={i} />
      ))}
      {loading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  )
}

function Message({ msg, index }) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)
  const [expandedChunk, setExpandedChunk] = useState(null)

  function handleCopy() {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      maxWidth: '82%',
      animation: `fadeUp 0.3s ease ${Math.min(index * 0.05, 0.2)}s both`
    }}>
      {/* Role label */}
      <div style={{ fontSize: 11, color: 'var(--text3)', paddingLeft: isUser ? 0 : 2, paddingRight: isUser ? 2 : 0 }}>
        {isUser ? 'You' : 'DocIntel'}
      </div>

      {/* Bubble */}
      <div style={{ position: 'relative', group: true }}>
        <div style={{
          padding: '11px 15px',
          borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          fontSize: 13.5, lineHeight: 1.7,
          background: isUser ? 'var(--accent)' : 'var(--bg3)',
          color: isUser ? 'white' : 'var(--text)',
          border: isUser ? 'none' : '1px solid var(--border)',
          whiteSpace: 'pre-wrap'
        }}>
          {msg.content}
        </div>

        {/* Copy button — only on assistant messages */}
        {!isUser && (
          <button
            onClick={handleCopy}
            title="Copy answer"
            style={{
              position: 'absolute', top: 8, right: 8,
              background: copied ? 'rgba(62,207,142,0.15)' : 'var(--bg4)',
              border: `1px solid ${copied ? 'rgba(62,207,142,0.3)' : 'var(--border2)'}`,
              borderRadius: 6, padding: '3px 7px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: copied ? 'var(--green)' : 'var(--text3)',
              transition: 'all 0.2s',
              animation: copied ? 'copyPop 0.2s ease' : 'none'
            }}
          >
            {copied ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {/* Source citations */}
      {msg.source_chunks?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', paddingLeft: 2 }}>Sources used</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {msg.source_chunks.map((chunk, i) => (
              <div key={i}>
                <button
                  onClick={() => setExpandedChunk(expandedChunk === i ? null : i)}
                  style={{
                    background: expandedChunk === i ? 'rgba(124,111,247,0.12)' : 'var(--bg4)',
                    border: `1px solid ${expandedChunk === i ? 'var(--accent)' : 'var(--border2)'}`,
                    color: expandedChunk === i ? 'var(--accent2)' : 'var(--text3)',
                    fontSize: 11, padding: '3px 10px', borderRadius: 5,
                    cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 5
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <path d="M14 2v6h6"/>
                  </svg>
                  Page {chunk.page}
                  <span style={{
                    background: 'var(--bg3)', borderRadius: 3, padding: '1px 4px',
                    fontSize: 10, color: chunk.score > 0.7 ? 'var(--green)' : 'var(--text3)'
                  }}>
                    {Math.round(chunk.score * 100)}%
                  </span>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ transform: expandedChunk === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                {/* Expanded chunk text */}
                {expandedChunk === i && (
                  <div style={{
                    marginTop: 6, padding: '10px 12px',
                    background: 'var(--bg3)', border: '1px solid var(--border2)',
                    borderLeft: '2px solid var(--accent)',
                    borderRadius: 8, fontSize: 12, color: 'var(--text2)',
                    lineHeight: 1.65, maxWidth: 420,
                    animation: 'fadeUp 0.2s ease'
                  }}>
                    {chunk.text.length > 400 ? chunk.text.slice(0, 400) + '...' : chunk.text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ alignSelf: 'flex-start', animation: 'fadeUp 0.2s ease' }}>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>DocIntel</div>
      <div style={{
        display: 'inline-flex', gap: 5, alignItems: 'center',
        padding: '12px 16px', background: 'var(--bg3)',
        borderRadius: '14px 14px 14px 4px', border: '1px solid var(--border)'
      }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
            animation: `pulse 1.2s ease-in-out ${delay}s infinite`
          }}/>
        ))}
        <style>{`@keyframes pulse{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
      </div>
    </div>
  )
}
