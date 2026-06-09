import { AlertCircle, CheckCircle, Star, Video } from 'lucide-react';

function ScoreBadge({ score }) {
  const color = score >= 7 ? '#34D399' : score >= 5 ? '#FBBF24' : '#F87171';
  return (
    <div style={{
      position: 'absolute', top: 6, right: 6,
      background: 'rgba(0,0,0,0.8)', borderRadius: 6, padding: '2px 6px',
      display: 'flex', alignItems: 'center', gap: 3,
      fontSize: 11, fontWeight: 700, color,
    }}>
      <Star size={10} fill={color} color={color} />
      {score}
    </div>
  );
}

function MediaThumbnail({ file, analysis, isAnalyzing }) {
  const hasPeople = analysis?.hasPeople;

  return (
    <div style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: 'var(--color-card)' }}>
      {file.thumbnailUrl ? (
        <img src={file.thumbnailUrl} alt={file.originalName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Video size={28} color="var(--color-muted)" />
          <span style={{ fontSize: 10, color: 'var(--color-muted)', textAlign: 'center', padding: '0 8px' }}>
            {file.originalName}
          </span>
        </div>
      )}

      {hasPeople && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(239,68,68,0.6)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 22 }}>✕</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', textAlign: 'center', padding: '0 8px' }}>
            People detected
          </span>
        </div>
      )}

      {isAnalyzing && !analysis && (
        <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />
      )}

      {analysis && !hasPeople && <ScoreBadge score={analysis.reelScore} />}

      {analysis && (
        <div style={{ position: 'absolute', top: 6, left: 6 }}>
          {hasPeople
            ? <AlertCircle size={16} color="#F87171" fill="rgba(0,0,0,0.7)" />
            : <CheckCircle size={16} color="#34D399" fill="rgba(0,0,0,0.7)" />}
        </div>
      )}

      {analysis && !hasPeople && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          padding: '16px 6px 6px',
          fontSize: 10, color: '#E2E8F0', textTransform: 'capitalize', textAlign: 'center',
        }}>
          {analysis.contentType}
        </div>
      )}
    </div>
  );
}

export default function MediaGrid({ uploadedFiles, analyzedAssets, isAnalyzing }) {
  const analysisMap = {};
  analyzedAssets.forEach((a) => { analysisMap[a.id] = a.analysis; });

  const filteredCount = analyzedAssets.filter((a) => a.analysis && !a.analysis.hasPeople).length;
  const flaggedCount = analyzedAssets.filter((a) => a.analysis && a.analysis.hasPeople).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#E2E8F0' }}>
          Media ({uploadedFiles.length})
        </h3>
        {analyzedAssets.length > 0 && (
          <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
            <span style={{ color: '#34D399' }}>✓ {filteredCount} usable</span>
            {flaggedCount > 0 && <span style={{ color: '#F87171' }}>✕ {flaggedCount} flagged</span>}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
        {uploadedFiles.map((file) => (
          <MediaThumbnail
            key={file.id}
            file={file}
            analysis={analysisMap[file.id]}
            isAnalyzing={isAnalyzing}
          />
        ))}
      </div>

      {flaggedCount > 0 && analyzedAssets.length > 0 && (
        <div style={{
          marginTop: 12,
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10, padding: '10px 14px',
          fontSize: 12, color: '#FCA5A5',
        }}>
          👤🚫 {flaggedCount} file{flaggedCount > 1 ? 's' : ''} skipped — people detected. Upload faceless content to use them.
        </div>
      )}
    </div>
  );
}
