import { AlertTriangle, X, RefreshCw } from 'lucide-react';

const VARIANTS = {
  error: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', icon: '#F87171', text: '#FCA5A5', retryBg: 'rgba(239,68,68,0.2)' },
  warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', icon: '#FBBF24', text: '#FDE68A', retryBg: 'rgba(245,158,11,0.2)' },
};

export default function ErrorBanner({ message, onDismiss, onRetry, variant = 'error' }) {
  const c = VARIANTS[variant] || VARIANTS.error;
  return (
    <div style={{
      background: c.bg,
      borderBottom: `1px solid ${c.border}`,
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <AlertTriangle size={16} color={c.icon} flexShrink={0} />
      <span style={{ flex: 1, fontSize: 13, color: c.text }}>{message}</span>
      <div style={{ display: 'flex', gap: 8 }}>
        {onRetry && (
          <button onClick={onRetry} style={{
            background: c.retryBg,
            color: c.text,
            border: 'none',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}>
            <RefreshCw size={11} /> Retry
          </button>
        )}
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <X size={14} color={c.text} />
        </button>
      </div>
    </div>
  );
}
