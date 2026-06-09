import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { processFile } from '../lib/mediaProcessor';

const ACCEPTED = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/webm': ['.webm'],
  'video/x-m4v': ['.m4v'],
};

export default function UploadZone({ onFilesReady }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [uploadError, setUploadError] = useState(null);

  const onDrop = useCallback(async (accepted, rejected) => {
    setUploadError(null);

    if (rejected.length > 0) {
      setUploadError(`${rejected.length} file(s) rejected — only JPG, PNG, WEBP, MP4, MOV, WEBM, M4V allowed.`);
    }
    if (accepted.length === 0) return;

    setIsProcessing(true);
    const processed = [];

    for (let i = 0; i < accepted.length; i++) {
      const file = accepted[i];
      setProgress(`Processing ${i + 1} / ${accepted.length}…`);
      try {
        const result = await processFile(file, uuidv4());
        processed.push(result);
      } catch (err) {
        console.error('Failed to process', file.name, err);
      }
    }

    setIsProcessing(false);
    setProgress('');
    if (processed.length > 0) onFilesReady(processed);
  }, [onFilesReady]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 10,
    maxSize: 100 * 1024 * 1024,
    disabled: isProcessing,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? '#7C3AED' : 'var(--color-border)'}`,
          borderRadius: 16,
          padding: 40,
          textAlign: 'center',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          background: isDragActive ? 'rgba(124,58,237,0.08)' : 'var(--color-surface)',
          transition: 'all 0.2s',
        }}
      >
        <input {...getInputProps()} />
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(124,58,237,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Upload size={24} color="#7C3AED" />
        </div>

        {isProcessing ? (
          <p style={{ color: '#A78BFA', margin: 0, fontWeight: 600 }}>{progress}</p>
        ) : isDragActive ? (
          <p style={{ color: '#7C3AED', fontWeight: 600, margin: 0 }}>Drop your media here</p>
        ) : (
          <>
            <p style={{ fontWeight: 600, margin: '0 0 4px', color: '#E2E8F0' }}>
              Drag & drop media here
            </p>
            <p style={{ color: 'var(--color-muted)', fontSize: 13, margin: 0 }}>
              Photos (JPG, PNG, WEBP) or videos (MP4, MOV, WEBM, M4V) · up to 10 files
            </p>
          </>
        )}
      </div>

      {uploadError && (
        <div style={{
          marginTop: 10,
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10,
          padding: '10px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, color: '#FCA5A5' }}>{uploadError}</span>
          <button onClick={() => setUploadError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={14} color="#FCA5A5" />
          </button>
        </div>
      )}
    </div>
  );
}
