import { TrendingUp, Calendar, Lightbulb } from 'lucide-react';

export default function NichePanel({ data }) {
  if (!data) return null;

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 16,
      padding: 20,
      animation: 'slideUp 0.4s ease-out',
    }} className="animate-slide-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #7C3AED22, #EC489922)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <TrendingUp size={18} color="#A78BFA" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>Your Niche</h3>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-muted)' }}>AI-detected based on your content</p>
        </div>
      </div>

      <div style={{
        display: 'inline-block',
        background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
        borderRadius: 20,
        padding: '5px 16px',
        fontSize: 14,
        fontWeight: 700,
        color: '#fff',
        marginBottom: 10,
      }}>
        {data.niche}
      </div>

      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
        {data.nicheDescription}
      </p>

      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Content Pillars
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {data.contentPillars?.map((pillar, i) => (
            <span key={i} style={{
              background: 'rgba(124,58,237,0.12)',
              color: '#A78BFA',
              border: '1px solid rgba(124,58,237,0.25)',
              borderRadius: 20,
              padding: '3px 12px',
              fontSize: 12,
              fontWeight: 500,
            }}>
              {pillar}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{
          flex: 1,
          background: 'rgba(124,58,237,0.08)',
          borderRadius: 10,
          padding: '10px 12px',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}>
          <Calendar size={14} color="#A78BFA" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--color-muted)' }}>Posting Cadence</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{data.postingCadence}</p>
          </div>
        </div>

        <div style={{
          flex: 1,
          background: 'rgba(236,72,153,0.08)',
          borderRadius: 10,
          padding: '10px 12px',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}>
          <Lightbulb size={14} color="#EC4899" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--color-muted)' }}>Growth Tip</p>
            <p style={{ margin: 0, fontSize: 12, color: '#E2E8F0', lineHeight: 1.4 }}>{data.growthTip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
