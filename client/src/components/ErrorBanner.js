import { AlertTriangle, X, RefreshCw } from 'lucide-react';

export default function ErrorBanner({ message, onDismiss, onRetry }) {
  return (
    <div style={{
      background: 'rgba(239,68,68,0.1)',
      borderBottom: '1px solid rgba(239,68,68,0.25)',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <AlertTriangle size={16} color="#F87171" flexShrink={0} />
      <span style={{ flex: 1, fontSize: 13, color: '#FCA5A5' }}>{message}</span>
      <div style={{ display: 'flex', gap: 8 }}>
        {onRetry && (
          <button onClick={onRetry} style={{
            background: 'rgba(239,68,68,0.2)',
            color: '#FCA5A5',
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
          <X size={14} color="#FCA5A5" />
        </button>
      </div>
    </div>
  );
}
