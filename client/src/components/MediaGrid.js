import { Star, Users, Video } from 'lucide-react';

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

function PeopleBadge() {
  return (
    <div style={{
      position: 'absolute', top: 6, left: 6,
      background: 'rgba(0,0,0,0.8)', borderRadius: 6, padding: '2px 6px',
      display: 'flex', alignItems: 'center', gap: 3,
      fontSize: 11, fontWeight: 600, color: '#A78BFA',
    }} title="People detected in this asset">
      <Users size={10} />
    </div>
  );
}

function MediaThumbnail({ file, analysis, isAnalyzing }) {
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

      {isAnalyzing && !analysis && (
        <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />
      )}

      {analysis?.hasPeople && <PeopleBadge />}
      {analysis && <ScoreBadge score={analysis.reelScore} />}

      {analysis && (
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

  const usableCount = analyzedAssets.filter((a) => a.analysis).length;
  const peopleCount = analyzedAssets.filter((a) => a.analysis?.hasPeople).length;

  return (
    <div>
      <div className="wrap-row" style={{ marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#E2E8F0' }}>
          Media ({uploadedFiles.length})
        </h3>
        {analyzedAssets.length > 0 && (
          <div style={{ display: 'flex', gap: 10, fontSize: 12, flexWrap: 'wrap' }}>
            <span style={{ color: '#34D399' }}>✓ {usableCount} analyzed</span>
            {peopleCount > 0 && (
              <span style={{ color: '#A78BFA', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Users size={12} /> {peopleCount} with people
              </span>
            )}
          </div>
        )}
      </div>

      <div className="media-grid">
        {uploadedFiles.map((file) => (
          <MediaThumbnail
            key={file.id}
            file={file}
            analysis={analysisMap[file.id]}
            isAnalyzing={isAnalyzing}
          />
        ))}
      </div>
    </div>
  );
}
