import './App.css';
import './index.css';
import { useState, useCallback } from 'react';
import TopBar from './components/TopBar';
import UploadZone from './components/UploadZone';
import MediaGrid from './components/MediaGrid';
import ReelConceptsPanel from './components/ReelConceptsPanel';
import CaptionDrawer from './components/CaptionDrawer';
import NichePanel from './components/NichePanel';
import EmptyState from './components/EmptyState';
import ErrorBanner from './components/ErrorBanner';
import { analyzeMedia, generateReels, generateCaptions, detectNiche } from './lib/api';

export default function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analyzedAssets, setAnalyzedAssets] = useState([]);
  const [reelConcepts, setReelConcepts] = useState([]);
  const [nicheData, setNicheData] = useState(null);
  const [captionData, setCaptionData] = useState(null);
  const [activeConcept, setActiveConcept] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReels, setIsGeneratingReels] = useState(false);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [isDetectingNiche, setIsDetectingNiche] = useState(false);

  const [error, setError] = useState(null);
  const [analysisStep, setAnalysisStep] = useState('');

  const handleFilesReady = useCallback((files) => {
    setUploadedFiles(files);
    setAnalyzedAssets([]);
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
    setReelConcepts([]);
    setNicheData(null);
    setCaptionData(null);

    try {
      setAnalysisStep('Analyzing media with AI...');
      const { results } = await analyzeMedia(uploadedFiles);
      setAnalyzedAssets(results);

      const clean = results.filter((r) => r.analysis && !r.analysis.hasPeople);

      if (clean.length === 0) {
        setError('All uploaded media contains people. Upload faceless content to generate reels.');
        setIsAnalyzing(false);
        setAnalysisStep('');
        return;
      }

      setAnalysisStep('Generating reel concepts...');
      setIsGeneratingReels(true);
      const cleanAssets = clean.map((r) => r.analysis);
      const { concepts } = await generateReels(cleanAssets);
      setReelConcepts(concepts);
      setActiveConcept(concepts[0]);
      setIsGeneratingReels(false);

      setAnalysisStep('Detecting your niche...');
      setIsDetectingNiche(true);
      const niche = await detectNiche(cleanAssets);
      setNicheData(niche);
      setIsDetectingNiche(false);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
      setIsGeneratingReels(false);
      setAnalysisStep('');
    }
  }, [uploadedFiles]);

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
  const filteredAssets = analyzedAssets.filter((a) => a.analysis && !a.analysis.hasPeople);
  const flaggedAssets = analyzedAssets.filter((a) => a.analysis && a.analysis.hasPeople);

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
                  filteredCount={filteredAssets.length}
                  flaggedCount={flaggedAssets.length}
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
    </div>
  );
}
