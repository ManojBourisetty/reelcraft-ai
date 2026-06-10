import { useState } from 'react';
import { X, Copy, Check, Download, Clock, MousePointer } from 'lucide-react';

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      style={{
        background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(124,58,237,0.15)',
        color: copied ? '#34D399' : '#A78BFA',
        border: `1px solid ${copied ? 'rgba(52,211,153,0.3)' : 'rgba(124,58,237,0.3)'}`,
        borderRadius: 7,
        padding: '5px 10px',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {label || (copied ? 'Copied!' : 'Copy')}
    </button>
  );
}

function CaptionCard({ caption }) {
  const styleLabels = {
    short_punchy: '⚡ Short & Punchy',
    storytelling: '📖 Storytelling',
    question: '❓ Question Hook',
  };

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)' }}>
          {styleLabels[caption.style] || caption.style}
        </span>
        <CopyButton text={caption.text} />
      </div>
      <p style={{ margin: 0, fontSize: 14, color: '#CBD5E1', lineHeight: 1.6 }}>{caption.text}</p>
    </div>
  );
}

export default function CaptionDrawer({ data, concept, isLoading, onClose }) {
  const [activeTab, setActiveTab] = useState('captions');

  const hashtagText = data?.hashtags?.map((h) => `#${h}`).join(' ') || '';
  const productionChecklist = [
    'Import all approved clips into CapCut or Instagram editor',
    'Apply the recommended transition style between each clip',
    'Add text overlays matching the script timing',
    'Set music to the suggested genre (fade in at 0s)',
    'Export at 1080×1920 (9:16 vertical)',
    'Add captions using auto-caption feature',
    'Review at 1x speed — check for cuts at beat drops',
    'Post at the recommended time for maximum reach',
  ];

  const downloadBrief = () => {
    const lines = [
      `REELCRAFT AI — PRODUCTION BRIEF`,
      `================================`,
      ``,
      `CONCEPT: ${concept?.title}`,
      `MOOD: ${concept?.mood}`,
      `DURATION: ${concept?.duration}`,
      ``,
      `HOOK (First 3 seconds):`,
      concept?.hook,
      ``,
      `SCRIPT / TEXT OVERLAYS:`,
      concept?.script,
      ``,
      `MUSIC GENRE: ${concept?.musicGenre}`,
      `SONG SUGGESTIONS:`,
      ...(concept?.musicSuggestions?.map((s) => `  • ${s}`) || []),
      ``,
      `TRANSITIONS: ${concept?.transitions}`,
      ``,
      `CLIP ORDER:`,
      ...(concept?.clipOrder?.map((c) => `  [${c.startSec}s-${c.endSec}s] ${c.description}`) || []),
      ``,
      `CAPTIONS:`,
      ...(data?.captions?.map((c) => `\n[${c.style}]\n${c.text}`) || []),
      ``,
      `HASHTAGS:`,
      hashtagText,
      ``,
      `BEST POST TIME: ${data?.postingTime}`,
      `CALL TO ACTION: ${data?.callToAction}`,
      ``,
      `PRODUCTION CHECKLIST:`,
      ...productionChecklist.map((item) => `  [ ] ${item}`),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reelcraft-brief-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'captions', label: 'Captions' },
    { id: 'hashtags', label: 'Hashtags' },
    { id: 'checklist', label: 'Production' },
  ];

  return (
    <div className="caption-drawer">
      {/* Header */}
      <div className="caption-drawer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#F1F5F9' }}>
            📝 Captions & Assets
          </h3>
          {concept && (
            <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>for "{concept.title}"</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={downloadBrief}
            style={{
              background: 'rgba(124,58,237,0.15)',
              color: '#A78BFA',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: 8,
              padding: '7px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Download size={13} /> Download Brief
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={18} color="var(--color-muted)" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, padding: '0 20px', borderBottom: '1px solid var(--color-border)', flexShrink: 0, overflowX: 'auto' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #7C3AED' : '2px solid transparent',
              color: activeTab === tab.id ? '#A78BFA' : 'var(--color-muted)',
              padding: '10px 16px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="caption-drawer-body">

        {activeTab === 'captions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data?.captions?.map((cap, i) => <CaptionCard key={i} caption={cap} />)}

            {(data?.postingTime || data?.callToAction) && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
                {data.postingTime && (
                  <div style={{
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <Clock size={14} color="#FBBF24" />
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--color-muted)' }}>Best time to post</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{data.postingTime}</p>
                    </div>
                  </div>
                )}
                {data.callToAction && (
                  <div style={{
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <MousePointer size={14} color="#EC4899" />
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--color-muted)' }}>Call to Action</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{data.callToAction}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'hashtags' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-muted)' }}>
                {data?.hashtags?.length || 0} hashtags
              </p>
              <CopyButton text={hashtagText} label="Copy All" />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data?.hashtags?.map((tag, i) => (
                <span
                  key={i}
                  style={{
                    background: 'rgba(124,58,237,0.12)',
                    color: '#A78BFA',
                    border: '1px solid rgba(124,58,237,0.25)',
                    borderRadius: 20,
                    padding: '4px 12px',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigator.clipboard.writeText(`#${tag}`)}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--color-muted)' }}>
              Follow this checklist in CapCut or Instagram editor:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {productionChecklist.map((item, i) => (
                <ChecklistItem key={i} text={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChecklistItem({ text }) {
  const [checked, setChecked] = useState(false);
  return (
    <div
      onClick={() => setChecked(!checked)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 14px',
        background: checked ? 'rgba(52,211,153,0.08)' : 'var(--color-card)',
        border: `1px solid ${checked ? 'rgba(52,211,153,0.3)' : 'var(--color-border)'}`,
        borderRadius: 10,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <div style={{
        width: 18,
        height: 18,
        borderRadius: 5,
        border: `2px solid ${checked ? '#34D399' : 'var(--color-border)'}`,
        background: checked ? '#34D399' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 1,
        transition: 'all 0.2s',
      }}>
        {checked && <Check size={11} color="#000" strokeWidth={3} />}
      </div>
      <span style={{
        fontSize: 13,
        color: checked ? '#34D399' : '#CBD5E1',
        textDecoration: checked ? 'line-through' : 'none',
        lineHeight: 1.5,
        transition: 'all 0.2s',
      }}>{text}</span>
    </div>
  );
}
