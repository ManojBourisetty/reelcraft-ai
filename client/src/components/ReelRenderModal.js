import { X, Download, Film, Loader, AlertTriangle } from 'lucide-react';

export default function ReelRenderModal({ state, onClose }) {
  // state: { status: 'rendering'|'done'|'error', step, ratio, videoUrl, error, title }
  if (!state) return null;

  const { status, step, ratio, videoUrl, error, title } = state;

  return (
    <div
      onClick={status === 'rendering' ? undefined : onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 18, padding: 24, width: '100%', maxWidth: 420,
          position: 'relative',
        }}
      >
        {status !== 'rendering' && (
          <button onClick={onClose} aria-label="Close"
            style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} color="var(--color-muted)" />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <Film size={18} color="#7C3AED" />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#F1F5F9' }}>
            {status === 'done' ? 'Your reel is ready' : status === 'error' ? 'Render failed' : 'Creating your reel'}
          </h3>
        </div>

        {status === 'rendering' && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <Loader size={32} color="#A78BFA" style={{ animation: 'spin 1s linear infinite', marginBottom: 14 }} />
            <p style={{ margin: '0 0 14px', fontSize: 14, color: '#CBD5E1' }}>
              {step || 'Working…'}
              {ratio != null && (
                <span style={{ color: '#A78BFA', fontWeight: 600 }}> {Math.round(ratio * 100)}%</span>
              )}
            </p>
            <div style={{ height: 6, borderRadius: 4, background: 'var(--color-card)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: ratio != null ? `${Math.round(ratio * 100)}%` : '40%',
                background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                transition: 'width 0.3s',
                animation: ratio == null ? 'pulse 1.2s ease-in-out infinite' : 'none',
              }} />
            </div>
            <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--color-muted)' }}>
              Rendering happens on your device — nothing is uploaded.
            </p>
          </div>
        )}

        {status === 'done' && videoUrl && (
          <>
            <video
              src={videoUrl}
              controls
              playsInline
              style={{ width: '100%', borderRadius: 12, aspectRatio: '9 / 16', background: '#000', objectFit: 'contain' }}
            />
            <a
              href={videoUrl}
              download={`${(title || 'reelcraft').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.mp4`}
              style={{
                marginTop: 16, width: '100%',
                background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                color: '#fff', borderRadius: 10, padding: '11px',
                fontWeight: 600, fontSize: 14, textDecoration: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Download size={15} /> Download MP4
            </a>
          </>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '8px 0' }}>
            <AlertTriangle size={32} color="#F87171" />
            <p style={{ margin: 0, fontSize: 13, color: '#FCA5A5', textAlign: 'center', lineHeight: 1.5 }}>
              {error || 'Something went wrong while rendering.'}
            </p>
          </div>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        `}</style>
      </div>
    </div>
  );
}
