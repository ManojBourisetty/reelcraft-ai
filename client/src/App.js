import './App.css';
import './index.css';
import { useState, useCallback, useRef } from 'react';
import TopBar from './components/TopBar';
import UploadZone from './components/UploadZone';
import MediaGrid from './components/MediaGrid';
import ReelConceptsPanel from './components/ReelConceptsPanel';
import CaptionDrawer from './components/CaptionDrawer';
import NichePanel from './components/NichePanel';
import EmptyState from './components/EmptyState';
import ErrorBanner from './components/ErrorBanner';
import ReelRenderModal from './components/ReelRenderModal';
import { analyzeMedia, generateReels, generateCaptions, detectNiche } from './lib/api';
import { renderReel, buildClips } from './lib/videoRenderer';

// Cap how many top-ranked assets are fed to the reel/niche models so large
// uploads don't blow the prompt budget. The grid still shows everything.
const REEL_MAX_ASSETS = 30;

export default function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analyzedAssets, setAnalyzedAssets] = useState([]);
  // Top-ranked assets (by AI reel-score) actually used to build reels — kept in
  // a fixed order so reel clipOrder indices map back to the right source files.
  const [rankedAssets, setRankedAssets] = useState([]);
  const [reelConcepts, setReelConcepts] = useState([]);
  const [reelLength, setReelLength] = useState('medium'); // 'short' | 'medium' | 'long'
  const [nicheData, setNicheData] = useState(null);
  const [captionData, setCaptionData] = useState(null);
  const [activeConcept, setActiveConcept] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReels, setIsGeneratingReels] = useState(false);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [isDetectingNiche, setIsDetectingNiche] = useState(false);

  const [error, setError] = useState(null);
  const [analysisStep, setAnalysisStep] = useState('');

  // Original File objects kept in-browser only (never sent to backend) for rendering.
  const originalFilesRef = useRef({});
  const [renderState, setRenderState] = useState(null);

  const handleFilesReady = useCallback((files) => {
    // Split the heavy original File off the descriptor so it stays client-side.
    const originals = {};
    const descriptors = files.map(({ file, ...rest }) => {
      originals[rest.id] = file;
      return rest;
    });
    originalFilesRef.current = originals;

    setUploadedFiles(descriptors);
    setAnalyzedAssets([]);
    setRankedAssets([]);
    setReelConcepts([]);
    setNicheData(null);
    setCaptionData(null);
    setActiveConcept(null);
    setError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload some media first.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setAnalyzedAssets([]);
    setRankedAssets([]);
    setReelConcepts([]);
    setNicheData(null);
    setCaptionData(null);

    try {
      const total = uploadedFiles.length;
      setAnalysisStep(`Analyzing media with AI… (0/${total})`);
      const { results } = await analyzeMedia(uploadedFiles, (done, t) => {
        setAnalysisStep(`Analyzing media with AI… (${done}/${t})`);
      });
      setAnalyzedAssets(results);

      const usable = results.filter((r) => r.analysis);

      if (usable.length === 0) {
        const firstError = results.find((r) => r.error)?.error;
        setError(
          firstError
            ? `Analysis failed: ${firstError}`
            : 'Analysis failed for all uploaded media. Please try again.'
        );
        setIsAnalyzing(false);
        setAnalysisStep('');
        return;
      }

      // Rank by AI reel-score (desc) and take the strongest assets. The model
      // then picks/orders the best of these into clips; the same ordered list
      // backs reel rendering so clip indices resolve to the right files.
      const ranked = [...usable]
        .sort((a, b) => (b.analysis.reelScore || 0) - (a.analysis.reelScore || 0))
        .slice(0, REEL_MAX_ASSETS);
      setRankedAssets(ranked);

      setAnalysisStep('Generating reel concepts...');
      setIsGeneratingReels(true);
      const rankedAnalyses = ranked.map((r) => r.analysis);
      const { concepts } = await generateReels(rankedAnalyses, reelLength);
      setReelConcepts(concepts);
      setActiveConcept(concepts[0]);
      setIsGeneratingReels(false);

      setAnalysisStep('Detecting your niche...');
      setIsDetectingNiche(true);
      const niche = await detectNiche(rankedAnalyses);
      setNicheData(niche);
      setIsDetectingNiche(false);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
      setIsGeneratingReels(false);
      setAnalysisStep('');
    }
  }, [uploadedFiles, reelLength]);

  // Re-generate reel concepts at a different length without re-analyzing.
  const handleChangeLength = useCallback(async (length) => {
    setReelLength(length);
    if (rankedAssets.length === 0 || isGeneratingReels) return;

    setError(null);
    setIsGeneratingReels(true);
    try {
      const { concepts } = await generateReels(rankedAssets.map((r) => r.analysis), length);
      setReelConcepts(concepts);
      setActiveConcept(concepts[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGeneratingReels(false);
    }
  }, [rankedAssets, isGeneratingReels]);

  const handleGetCaptions = useCallback(async (concept) => {
    setError(null);
    setIsGeneratingCaptions(true);
    setCaptionData(null);
    try {
      const data = await generateCaptions(concept);
      setCaptionData(data);
      setActiveConcept(concept);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGeneratingCaptions(false);
    }
  }, []);

  const isWorking = isAnalyzing || isGeneratingReels || isDetectingNiche;
  const peopleCount = rankedAssets.filter((a) => a.analysis?.hasPeople).length;

  const handleCreateReel = useCallback(async (concept) => {
    const clips = buildClips(concept, rankedAssets, originalFilesRef.current);
    if (clips.length === 0) {
      setRenderState({
        status: 'error',
        error: 'No source clips available. Re-upload your media, then analyze and try again.',
        title: concept?.title,
      });
      return;
    }

    setRenderState({ status: 'rendering', step: 'Preparing…', ratio: null, title: concept?.title });

    try {
      const blob = await renderReel(clips, (step, ratio) => {
        setRenderState((prev) => (prev ? { ...prev, step, ratio } : prev));
      });
      const videoUrl = URL.createObjectURL(blob);
      setRenderState({ status: 'done', videoUrl, title: concept?.title });
    } catch (err) {
      setRenderState({ status: 'error', error: err.message, title: concept?.title });
    }
  }, [rankedAssets]);

  const handleCloseRender = useCallback(() => {
    setRenderState((prev) => {
      if (prev?.videoUrl) URL.revokeObjectURL(prev.videoUrl);
      return null;
    });
  }, []);

  return (
    <div style={{ background: 'var(--color-dark)', minHeight: '100vh' }}>
      <TopBar
        onAnalyze={handleAnalyze}
        isWorking={isWorking}
        hasFiles={uploadedFiles.length > 0}
        step={analysisStep}
      />

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: uploadedFiles.length > 0 ? '1fr 1fr' : '1fr', gap: 24 }}>

          {/* Left Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <UploadZone onFilesReady={handleFilesReady} />

            {uploadedFiles.length > 0 && (
              <MediaGrid
                uploadedFiles={uploadedFiles}
                analyzedAssets={analyzedAssets}
                isAnalyzing={isAnalyzing}
              />
            )}

            {uploadedFiles.length === 0 && <EmptyState />}

            {nicheData && !isDetectingNiche && (
              <NichePanel data={nicheData} />
            )}
          </div>

          {/* Right Panel */}
          {uploadedFiles.length > 0 && (
            <div>
              {(isGeneratingReels || reelConcepts.length > 0) && (
                <ReelConceptsPanel
                  concepts={reelConcepts}
                  isLoading={isGeneratingReels}
                  activeConcept={activeConcept}
                  onSelectConcept={setActiveConcept}
                  onGetCaptions={handleGetCaptions}
                  isGeneratingCaptions={isGeneratingCaptions}
                  onCreateReel={handleCreateReel}
                  isRendering={renderState?.status === 'rendering'}
                  reelLength={reelLength}
                  onChangeLength={handleChangeLength}
                  usableCount={rankedAssets.length}
                  peopleCount={peopleCount}
                />
              )}

              {!isGeneratingReels && reelConcepts.length === 0 && uploadedFiles.length > 0 && (
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 16,
                  padding: 40,
                  textAlign: 'center',
                  color: 'var(--color-muted)',
                }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
                  <p style={{ fontSize: 15 }}>Click <strong style={{ color: '#E2E8F0' }}>Analyze My Media</strong> to generate reel concepts</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {captionData && (
        <CaptionDrawer
          data={captionData}
          concept={activeConcept}
          isLoading={isGeneratingCaptions}
          onClose={() => setCaptionData(null)}
        />
      )}

      <ReelRenderModal state={renderState} onClose={handleCloseRender} />
    </div>
  );
}
