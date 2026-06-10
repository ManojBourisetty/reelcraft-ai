import { useState } from 'react';
import { Music, Clock, Zap, Film, ChevronRight, Loader, Video } from 'lucide-react';

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--color-card)', borderRadius: 14, padding: 20 }}>
      {[80, 60, 100, 50, 70].map((w, i) => (
        <div key={i} className="skeleton" style={{
          height: 14,
          borderRadius: 6,
          marginBottom: i < 4 ? 12 : 0,
          width: `${w}%`,
        }} />
      ))}
    </div>
  );
}

function ClipOrderList({ clips }) {
  if (!clips || clips.length === 0) return null;
  return (
    <div style={{ marginTop: 14 }}>
      <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Clip Order
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {clips.map((clip, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            fontSize: 13,
            color: '#CBD5E1',
          }}>
            <span style={{
              background: 'rgba(124,58,237,0.2)',
              color: '#A78BFA',
              borderRadius: 5,
              padding: '1px 7px',
              fontSize: 11,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              marginTop: 1,
            }}>
              {clip.startSec}s–{clip.endSec}s
            </span>
            <span>{clip.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConceptCard({ concept, isActive, onSelect, onGetCaptions, isGeneratingCaptions, onCreateReel, isRendering }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={isActive ? 'gradient-border' : ''}
      style={{
        background: 'var(--color-card)',
        borderRadius: 14,
        border: isActive ? 'none' : '1px solid var(--color-border)',
        overflow: 'hidden',
        transition: 'all 0.2s',
        cursor: 'pointer',
      }}
      onClick={() => { onSelect(); setExpanded(true); }}
    >
      {/* Header */}
      <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
              borderRadius: 6,
              padding: '2px 8px',
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
            }}>
              {concept.mood}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-muted)' }}>
              <Clock size={11} /> {concept.duration}
            </span>
          </div>
          <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#F1F5F9' }}>
            {concept.title}
          </h4>
          <p style={{ margin: 0, fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>
            <strong style={{ color: '#7C3AED' }}>Hook:</strong> {concept.hook}
          </p>

          {/* Always-visible primary action — render the actual reel video */}
          <button
            onClick={(e) => { e.stopPropagation(); onCreateReel(concept); }}
            disabled={isRendering}
            style={{
              marginTop: 12,
              width: '100%',
              background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px',
              fontWeight: 600,
              fontSize: 13,
              cursor: isRendering ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: isRendering ? 0.7 : 1,
            }}
            title="Stitch your clips into a 9:16 vertical MP4 — rendered in your browser"
          >
            {isRendering
              ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Rendering Reel...</>
              : <><Video size={13} /> Create Reel Video (9:16)</>
            }
          </button>
        </div>
        <ChevronRight
          size={16}
          color="var(--color-muted)"
          style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0, marginTop: 4 }}
        />
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--color-border)', paddingTop: 14 }}
          onClick={(e) => e.stopPropagation()}>

          <p style={{ margin: '0 0 14px', fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
            <strong style={{ color: '#E2E8F0' }}>Script:</strong> {concept.script}
          </p>

          <ClipOrderList clips={concept.clipOrder} />

          <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Music
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Music size={12} color="#EC4899" /> {concept.musicGenre}
              </p>
              {concept.musicSuggestions && (
                <div style={{ marginTop: 4 }}>
                  {concept.musicSuggestions.map((s, i) => (
                    <p key={i} style={{ margin: '2px 0', fontSize: 12, color: '#94A3B8' }}>♪ {s}</p>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Transitions
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Film size={12} color="#7C3AED" /> {concept.transitions}
              </p>
            </div>
          </div>

          <button
            onClick={() => onGetCaptions()}
            disabled={isGeneratingCaptions}
            style={{
              marginTop: 16,
              width: '100%',
              background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px',
              fontWeight: 600,
              fontSize: 13,
              cursor: isGeneratingCaptions ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: isGeneratingCaptions ? 0.7 : 1,
            }}
          >
            {isGeneratingCaptions
              ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Generating Captions...</>
              : <><Zap size={13} /> Generate Captions & Hashtags</>
            }
          </button>
        </div>
      )}
    </div>
  );
}

const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short', hint: '~15s' },
  { value: 'medium', label: 'Medium', hint: '~30s' },
  { value: 'long', label: 'Long', hint: '~60s' },
];

function LengthSelector({ value, onChange, disabled }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: 'var(--color-card)', padding: 4, borderRadius: 10, marginBottom: 14 }}>
      {LENGTH_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => !disabled && onChange(opt.value)}
            disabled={disabled}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: 7,
              padding: '7px 6px',
              fontSize: 12,
              fontWeight: 600,
              cursor: disabled ? 'not-allowed' : 'pointer',
              color: active ? '#fff' : 'var(--color-muted)',
              background: active ? 'linear-gradient(135deg, #7C3AED, #EC4899)' : 'transparent',
              opacity: disabled && !active ? 0.5 : 1,
              transition: 'all 0.15s',
            }}
            title={`${opt.label} reel (${opt.hint})`}
          >
            {opt.label} <span style={{ opacity: 0.8, fontWeight: 400 }}>{opt.hint}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function ReelConceptsPanel({
  concepts,
  isLoading,
  activeConcept,
  onSelectConcept,
  onGetCaptions,
  isGeneratingCaptions,
  onCreateReel,
  isRendering,
  reelLength,
  onChangeLength,
  usableCount,
  peopleCount,
}) {
  return (
    <div>
      <div className="wrap-row" style={{ marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#F1F5F9' }}>
          🎬 Reel Concepts
        </h2>
        {usableCount > 0 && (
          <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>
            Based on {usableCount} asset{usableCount > 1 ? 's' : ''}
            {peopleCount > 0 ? ` (${peopleCount} with people)` : ''}
          </span>
        )}
      </div>

      {onChangeLength && (
        <LengthSelector value={reelLength} onChange={onChangeLength} disabled={isLoading} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isLoading
          ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
          : concepts.map((concept, i) => (
              <ConceptCard
                key={i}
                concept={concept}
                isActive={activeConcept === concept}
                onSelect={() => onSelectConcept(concept)}
                onGetCaptions={() => onGetCaptions(concept)}
                isGeneratingCaptions={isGeneratingCaptions}
                onCreateReel={onCreateReel}
                isRendering={isRendering}
              />
            ))
        }
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
