export default function EmptyState() {
  const steps = [
    { emoji: '📸', title: 'Upload your media', desc: 'Photos or videos — any content' },
    { emoji: '🤖', title: 'AI analyzes content', desc: 'Scores each asset and tags content type' },
    { emoji: '🎬', title: 'Get 3 reel concepts', desc: 'Scripts, clips, music & transitions' },
    { emoji: '📋', title: 'Copy & post', desc: 'Captions, hashtags, production checklist' },
  ];

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 16,
      padding: 32,
    }}>
      <p style={{ margin: '0 0 24px', fontSize: 13, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>
        How it works
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'var(--color-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0,
            }}>
              {step.emoji}
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: '#E2E8F0' }}>{step.title}</p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-muted)' }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
