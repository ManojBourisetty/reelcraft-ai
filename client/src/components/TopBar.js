import { Sparkles, Loader } from 'lucide-react';

export default function TopBar({ onAnalyze, isWorking, hasFiles, step }) {
  return (
    <header style={{
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="topbar-inner">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}>🎬</div>
          <div>
            <span className="gradient-text" style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>
              ReelCraft
            </span>
            <span style={{ color: '#E2E8F0', fontWeight: 700, fontSize: 18 }}> AI</span>
          </div>
        </div>

        {/* Status + CTA */}
        <div className="topbar-actions">
          {isWorking && step && (
            <span className="topbar-step">
              <Loader size={13} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              {step}
            </span>
          )}
          <button
            className="topbar-cta"
            onClick={onAnalyze}
            disabled={isWorking || !hasFiles}
            style={{
              background: isWorking || !hasFiles
                ? 'var(--color-border)'
                : 'linear-gradient(135deg, #7C3AED, #EC4899)',
              color: isWorking || !hasFiles ? 'var(--color-muted)' : '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 20px',
              fontWeight: 600,
              fontSize: 14,
              cursor: isWorking || !hasFiles ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              whiteSpace: 'nowrap',
              transition: 'opacity 0.2s',
            }}
          >
            {isWorking
              ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</>
              : <><Sparkles size={15} /> Analyze My Media</>
            }
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </header>
  );
}
