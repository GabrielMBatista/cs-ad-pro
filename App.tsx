'use client';

import React, { useState, useEffect } from 'react';

import { AppView, Layer, ColorStyle, CSGOSkin, AspectRatio, ImageSize } from './types';
import { generateImage, editImage, analyzeImage, enhancePrompt } from './services/gemini';
import { findBestMatch } from './services/csgoApi';
import { generatePromptFromSkin } from './services/promptEngine';
import { saveCampaign } from './services/historyService';
import { useAutoSave } from './hooks/useAutoSave';

import ControlPanel from './components/ControlPanel';
import CanvasOverlay from './components/CanvasOverlay';
import { OverlaySystem } from './components/OverlaySystem';
import ImageUploader from './components/ImageUploader';
import SkinCatalog from './components/SkinCatalog';
import CampaignHistory from './components/CampaignHistory';
import QuickSkinSearch from './components/QuickSkinSearch';
import LayerManager from './components/LayerManager';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('low quality, blurry, distorted, generic weapon, duplicate items, watermark, signature, text, logo, username, artist name, modified reference item, redraw, altered silhouette');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Layer State (Unified)
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const [campaignId, setCampaignId] = useState<string>(() => crypto.randomUUID());

  const [analysisResult, setAnalysisResult] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [selectedOfficialSkin, setSelectedOfficialSkin] = useState<CSGOSkin | undefined>();
  const [leftTab, setLeftTab] = useState<'setup' | 'templates'>('setup');
  const [rightPanelTab, setRightPanelTab] = useState<'layers' | 'refine' | 'analyze' | 'history'>('layers');
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogMode, setCatalogMode] = useState<'setup' | 'layer'>('setup');

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [useThinking, setUseThinking] = useState(false);

  const [games, setGames] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['Counter-Strike', 'Valorant', 'League of Legends', 'Vida Real (Real World)'];
    const saved = localStorage.getItem('CS-games');
    return saved ? JSON.parse(saved) : ['Counter-Strike', 'Valorant', 'League of Legends', 'Vida Real (Real World)'];
  });
  const [selectedGame, setSelectedGame] = useState(games[0]);

  const [fonts, setFonts] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['Inter', 'Oswald', 'Impact', 'Verdana'];
    const saved = localStorage.getItem('CS-fonts');
    return saved ? JSON.parse(saved) : ['Inter', 'Oswald', 'Impact', 'Verdana'];
  });

  const [colorStyles, setColorStyles] = useState<ColorStyle[]>(() => {
    if (typeof window === 'undefined') return [
      { id: '1', name: 'Hi-Cinematic', colors: ['#ffffff', '#000000'] },
      { id: '2', name: 'Cyberpunk Neon', colors: ['#ff00ff', '#00ffff'] },
      { id: '3', name: 'Hyper Realistic', colors: ['#f97316', '#ffffff'] }
    ];
    const saved = localStorage.getItem('CS-styles');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Hi-Cinematic', colors: ['#ffffff', '#000000'] },
      { id: '2', name: 'Cyberpunk Neon', colors: ['#ff00ff', '#00ffff'] },
      { id: '3', name: 'Hyper Realistic', colors: ['#f97316', '#ffffff'] }
    ];
  });
  const [selectedStyleId, setSelectedStyleId] = useState(colorStyles[0].id);
  const selectedStyle = colorStyles.find(s => s.id === selectedStyleId) || colorStyles[0];

  // Auto-Save Hook
  const { isSaving, lastSaved } = useAutoSave({
    id: campaignId,
    prompt,
    imageUrl: backgroundImage,
    layers,
    skin: selectedOfficialSkin,
    status: 'draft',
    createdAt: Date.now() // Note: this updates creation time on save, ideally should be constant
  }, 2000);

  useEffect(() => {
    localStorage.setItem('CS-games', JSON.stringify(games));
    localStorage.setItem('CS-fonts', JSON.stringify(fonts));
    localStorage.setItem('CS-styles', JSON.stringify(colorStyles));
  }, [games, fonts, colorStyles]);

  // Auto-Prompt Engine
  useEffect(() => {
    if (selectedOfficialSkin && selectedGame === 'Counter-Strike') {
      const smartPrompt = generatePromptFromSkin(selectedOfficialSkin);
      setPrompt(smartPrompt);
    }
  }, [selectedOfficialSkin, selectedGame]);

  const imageUrlToBase64 = async (url: string): Promise<string> => {
    if (url.startsWith('data:')) return url;

    // Helper to fetch and convert to base64
    const fetchAndConvert = async (fetchUrl: string): Promise<string> => {
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          if (result.startsWith('data:image')) resolve(result);
          else reject(new Error("Invalid image data"));
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    try {
      return await fetchAndConvert(`https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=png`);
    } catch (e) {
      console.warn("Weserv failed", e);
    }

    try {
      return await fetchAndConvert(url);
    } catch (e) {
      console.error("Direct fetch failed", e);
      throw new Error("Falha ao carregar imagem. Tente salvar e usar upload manual.");
    }
  };

  const handleAutoPrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(prompt, selectedGame, selectedStyle.name, useThinking);
      setPrompt(enhanced);
    } catch (err) { console.error(err); }
    finally { setIsEnhancing(false); }
  };

  const addLayer = (type: 'text' | 'image' | 'sticker', src?: string) => {
    const newId = `${type}-${Date.now()}`;
    const zIndex = layers.length > 0 ? Math.max(...layers.map(l => l.zIndex)) + 1 : 1;

    const newLayer: Layer = {
      id: newId,
      type: type,
      visible: true,
      locked: false,
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1,
      zIndex: zIndex,
      opacity: 1,
      // Specifics
      text: type === 'text' ? 'NEW TEXT' : undefined,
      src: src,
      style: type === 'text' ? {
        fontSize: 32,
        color: selectedStyle.colors[0],
        fontFamily: fonts[0],
        fontWeight: '700',
        textAlign: 'center',
        shadow: true
      } : undefined
    };

    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newId);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLayer = (id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const handleReorderLayers = (newOrder: Layer[]) => {
    setLayers(newOrder);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);

    // Generate new ID for new campaign generation
    const newId = crypto.randomUUID();
    setCampaignId(newId);

    try {
      let officialRef = selectedOfficialSkin;

      if (selectedGame === 'Counter-Strike' && !officialRef) {
        setLoadingStage("Auto-Lookup: Skin Catalog...");
        officialRef = (await findBestMatch(prompt)) || undefined;
        if (officialRef) setSelectedOfficialSkin(officialRef);
      }

      let referenceBase64 = undefined;
      // Convert skin image to base64 if available
      if (officialRef?.image) {
        setLoadingStage("Prep: Visual Assets...");
        try {
          referenceBase64 = await imageUrlToBase64(officialRef.image);
        } catch (e: any) {
          console.error("Ref Load Error", e);
        }
      }

      setLoadingStage(`Synthesis: Pixel-Lock Creative...`);
      const generatedBgUrl = await generateImage(prompt, selectedGame, aspectRatio, undefined, negativePrompt);

      setBackgroundImage(generatedBgUrl);

      // Reset layers for new generation
      const initialLayers: Layer[] = [];
      let z = 1;

      // Add Weapon Layer if available
      if (referenceBase64) {
        initialLayers.push({
          id: 'weapon-main',
          type: 'sticker',
          src: referenceBase64,
          x: 50, y: 50, scale: 0.8, rotation: 0,
          zIndex: z++,
          opacity: 1,
          visible: true,
          locked: false
        });
      }

      // Add Default Title if no skin
      if (!officialRef) {
        initialLayers.push({
          id: 'title-main',
          type: 'text',
          text: 'AD CREATIVE',
          x: 50, y: 85,
          zIndex: z++,
          scale: 1, rotation: 0, opacity: 1, visible: true, locked: false,
          style: {
            fontSize: 32,
            color: selectedStyle.colors[0],
            fontFamily: fonts.includes('Oswald') ? 'Oswald' : fonts[0],
            fontWeight: '900',
            textAlign: 'center',
            shadow: true
          }
        });
      }

      setLayers(initialLayers);

      // Initial Save is handled by AutoSave hook soon, or we can force save here
      // But useAutoSave will trigger largely due to state change.

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Falha na síntese. Verifique API Key.");
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  const handleEditResult = async () => {
    if (!backgroundImage || !editPrompt.trim()) return;
    setIsLoading(true);
    setLoadingStage("Refining: Flash Image Modifier...");
    try {
      const url = await editImage(backgroundImage, editPrompt);
      setBackgroundImage(url);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleAnalyze = async (image: string) => {
    setIsLoading(true);
    setLoadingStage("Deep Vision Analysis...");
    try {
      const result = await analyzeImage(image, `Analise esta imagem publicitária.`, useThinking);
      setAnalysisResult(result);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleLoadCampaign = (campaign: import('./types').Campaign) => {
    setCampaignId(campaign.id);
    setBackgroundImage(campaign.imageUrl);
    setPrompt(campaign.prompt);

    // We need to ensure layers are compatible. 
    // If loading old campaign with 'overlays', convert them?
    if ((campaign as any).overlays && (!campaign.layers || campaign.layers.length === 0)) {
      // Convert legacy
      const legacyOverlays = (campaign as any).overlays as any[]; // Cast to any to avoid missing type import
      const convertedLayers: Layer[] = legacyOverlays.map((o, i) => ({
        id: o.id || `legacy-${i}`,
        type: 'text',
        text: o.text,
        x: o.x, y: o.y,
        rotation: o.rotation || 0,
        scale: 1,
        zIndex: i + 10,
        opacity: 1,
        visible: true,
        locked: false,
        style: {
          fontSize: o.fontSize,
          color: o.color,
          fontFamily: o.fontFamily,
          fontWeight: o.fontWeight,
          textAlign: o.textAlign,
        }
      }));
      setLayers(convertedLayers);
    } else {
      setLayers(campaign.layers || []);
    }

    if (campaign.skin) setSelectedOfficialSkin(campaign.skin);
  };

  const handleReset = () => {
    if (confirm("Start a new ad? This will clear your current workspace.")) {
      setBackgroundImage('');
      setLayers([]);
      setPrompt('');
      setSelectedOfficialSkin(undefined);
      setAnalysisResult('');
      setCampaignId(crypto.randomUUID());
    }
  };

  const handleDownload = async () => {
    if (!backgroundImage) return;

    const SIZE = 1024; // Output resolution
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loadImage = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    try {
      // Layer 1: Background
      const bgImg = await loadImage(backgroundImage);
      const bgAspect = bgImg.width / bgImg.height;
      let bx = 0, by = 0, bw = SIZE, bh = SIZE;
      if (bgAspect > 1) { bh = SIZE / bgAspect; by = (SIZE - bh) / 2; }
      else { bw = SIZE * bgAspect; bx = (SIZE - bw) / 2; }
      ctx.drawImage(bgImg, bx, by, bw, bh);

      // Sort layers by zIndex
      const renderLayers = [...layers].filter(l => l.visible).sort((a, b) => a.zIndex - b.zIndex);

      for (const layer of renderLayers) {
        ctx.save();
        const lx = (layer.x / 100) * SIZE;
        const ly = (layer.y / 100) * SIZE;

        ctx.translate(lx, ly);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.scale(layer.scale, layer.scale);
        ctx.globalAlpha = layer.opacity;

        if ((layer.type === 'image' || layer.type === 'sticker') && layer.src) {
          const img = await loadImage(layer.src);
          // Draw centered
          // Assume 100% scale = 500px width reference? Or native size
          // Let's us a standard reference size of 300px for consistency with visual scale
          const refSize = 300;
          // Maintain aspect
          const aspect = img.width / img.height;
          const dw = refSize;
          const dh = dw / aspect;

          // Shadow
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 15;
          ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);

        } else if (layer.type === 'text' && layer.text && layer.style) {
          const scaledFontSize = layer.style.fontSize! * (SIZE / 600);

          ctx.font = `${layer.style.fontWeight} ${scaledFontSize}px ${layer.style.fontFamily}`;
          ctx.fillStyle = layer.style.color!;
          ctx.textAlign = layer.style.textAlign as CanvasTextAlign;
          ctx.textBaseline = 'middle';

          if (layer.style.shadow) {
            ctx.shadowColor = 'rgba(0,0,0,0.9)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
          }

          const lines = layer.text.split('\n');
          const lineHeight = scaledFontSize * 1.2;
          const totalHeight = lines.length * lineHeight;
          lines.forEach((line, i) => {
            ctx.fillText(line, 0, (i * lineHeight) - (totalHeight / 2) + lineHeight / 2);
          });
        }

        ctx.restore();
      }

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cs-ad-pro-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');

    } catch (err) {
      console.error('Download failed:', err);
      alert('Falha ao exportar.');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-orange-500/30 overflow-hidden">
      <nav className="border-b border-zinc-800 bg-zinc-900/80 sticky top-0 z-50 backdrop-blur-md px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center font-black text-2xl skew-x-[-10deg] shadow-lg shadow-orange-900/20">G</div>
          <span className="oswald text-xl font-bold tracking-tighter uppercase">CS <span className="text-orange-600">AD-PRO</span></span>
        </div>

        <div className="flex items-center gap-4">
          {isSaving && <span className="text-[10px] text-zinc-500 animate-pulse uppercase font-black">Autosaving...</span>}
          <div className="hidden md:flex gap-2">
            <button onClick={handleReset} className="px-4 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
              + New Ad
            </button>
          </div>
          <label className="flex items-center gap-2 cursor-pointer bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700">
            <span className="text-[8px] font-black uppercase text-zinc-400">Deep Reasoning</span>
            <input type="checkbox" checked={useThinking} onChange={(e) => setUseThinking(e.target.checked)} className="hidden" />
            <div className={`w-8 h-4 rounded-full relative transition-colors ${useThinking ? 'bg-orange-600' : 'bg-zinc-700'}`}>
              <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${useThinking ? 'left-5' : 'left-1'}`} />
            </div>
          </label>
        </div>
      </nav>

      <main className="max-w-[1920px] mx-auto w-full p-4 overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
        <div className="grid grid-cols-12 gap-4 h-full">

          {/* LEFT COLUMN: CREATION ENGINE (3 cols) */}
          <div className="col-span-3 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 min-h-0" style={{ height: '100%' }}>
            {/* Setup & Template Tabs */}
            <div className="bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden shrink-0">
              <div className="grid grid-cols-2 p-1 gap-1 bg-zinc-950/50 rounded-t-xl">
                <button onClick={() => setLeftTab('setup')} className={`py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${leftTab === 'setup' ? 'bg-zinc-800 text-orange-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>Setup</button>
                <button onClick={() => setLeftTab('templates')} className={`py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${leftTab === 'templates' ? 'bg-zinc-800 text-orange-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>Templates</button>
              </div>

              <div className="p-4 space-y-4">
                {leftTab === 'setup' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Setup Content (Game etc) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-zinc-600 uppercase">Game Universe</label>
                        <select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-[10px] font-bold outline-none focus:border-orange-500 transition-colors">
                          {games.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-zinc-600 uppercase">Format</label>
                        <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as any)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-[10px] font-bold outline-none focus:border-orange-500 transition-colors">
                          {['1:1', '3:4', '4:3', '9:16', '16:9'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-zinc-600 uppercase">Visual Style</label>
                      <div className="grid grid-cols-3 gap-2">
                        {colorStyles.map(s => (
                          <button key={s.id} onClick={() => setSelectedStyleId(s.id)} className={`p-2 rounded-lg border text-[9px] font-bold uppercase truncate transition-all ${selectedStyleId === s.id ? 'border-orange-600 bg-orange-600/10 text-orange-500' : 'border-zinc-800 bg-zinc-950 text-zinc-500'}`}>
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {leftTab === 'templates' && (
                  <OverlaySystem
                    skin={selectedOfficialSkin}
                    layers={layers}
                    selectedId={selectedLayerId}
                    fonts={fonts}
                    onLayersChange={setLayers}
                    onUpdateLayer={updateLayer}
                    onDeleteLayer={deleteLayer}
                  />
                )}
              </div>
            </div>

            {/* Prompt Section */}
            <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-xl relative overflow-hidden flex flex-col shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <h3 className="oswald text-xs font-bold uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-600"></span> Subject & Prompt
                <button onClick={() => setShowCatalog(true)} className="ml-auto text-[9px] text-orange-500 hover:text-orange-400 font-bold uppercase tracking-wider border border-orange-600/30 px-2 py-0.5 rounded hover:bg-orange-600/10 transition-colors">+ Browse</button>
              </h3>

              <QuickSkinSearch onSelect={(s) => { setSelectedOfficialSkin(s); setSelectedGame('Counter-Strike'); }} />

              {selectedOfficialSkin && (
                <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-orange-600/40 shadow-inner group relative overflow-hidden">
                  <img src={selectedOfficialSkin.image} className="w-16 h-16 object-contain bg-zinc-900 rounded-lg shadow-sm z-10" />
                  <div className="flex-1 min-w-0 z-10">
                    <h4 className="text-[10px] font-black uppercase text-orange-400 truncate">{selectedOfficialSkin.name}</h4>
                    <button onClick={() => setSelectedOfficialSkin(undefined)} className="text-[8px] font-bold text-zinc-500 hover:text-white transition-colors mt-1">REMOVE</button>
                  </div>
                </div>
              )}

              <div className="space-y-2 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black text-zinc-400 uppercase">Scenario Description</label>
                  <button onClick={handleAutoPrompt} disabled={isEnhancing || !prompt.trim()} className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-orange-600/10 text-orange-400 hover:bg-orange-600 hover:text-white transition-all">✨ Enhance</button>
                </div>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the desired background..." className="w-full flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-medium focus:ring-1 focus:ring-orange-500 resize-none outline-none shadow-inner min-h-[100px]" />
              </div>

              <div className="pt-2">
                <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95 text-center">
                  {isLoading ? 'Synthesizing...' : 'GENERATE AD CAMPAIGN'}
                </button>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: CANVAS */}
          <div className="col-span-6 flex flex-col gap-4 h-full relative">
            <div className="flex-1 bg-zinc-900/30 rounded-3xl border border-zinc-800 flex items-center justify-center p-8 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <CanvasOverlay
                image={backgroundImage}
                layers={layers}
                selectedId={selectedLayerId}
                onSelect={setSelectedLayerId}
                onUpdateLayer={updateLayer}
              />
            </div>
            {backgroundImage && (
              <div className="absolute bottom-6 right-6 flex gap-2">
                <button onClick={handleDownload} className="bg-zinc-950 hover:bg-white hover:text-black text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all border border-zinc-800 shadow-2xl flex items-center gap-2">Download Result</button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: TOOLS */}
          <div className="col-span-3 flex flex-col gap-0 bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden min-h-0">
            <div className="flex border-b border-zinc-800">
              {(['layers', 'refine', 'analyze', 'history'] as const).map(t => (
                <button key={t} onClick={() => setRightPanelTab(t)} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-wider transition-colors ${rightPanelTab === t ? 'bg-zinc-800 text-orange-500 border-b-2 border-orange-500' : 'text-zinc-500 hover:text-zinc-300'}`}>{t}</button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 min-h-0">
              {rightPanelTab === 'layers' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h3 className="oswald text-xs font-bold uppercase text-zinc-500 tracking-widest mb-3">Layer Manager</h3>
                    <LayerManager
                      layers={layers}
                      selectedId={selectedLayerId}
                      onSelect={setSelectedLayerId}
                      onUpdateLayer={updateLayer}
                      onReorderLayers={handleReorderLayers}
                      onDeleteLayer={deleteLayer}
                      onAddLayer={addLayer}
                    />
                  </div>

                  <div className="border-t border-zinc-800 pt-4">
                    <ControlPanel
                      layers={layers}
                      selectedId={selectedLayerId}
                      fonts={fonts}
                      onUpdateLayer={updateLayer}
                      onAddLayer={() => addLayer('text')}
                      onDeleteLayer={deleteLayer}
                    />
                  </div>
                </div>
              )}

              {rightPanelTab === 'refine' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="oswald text-xs font-bold uppercase text-zinc-500 tracking-widest">AI In-Painting</h3>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-400 uppercase">Modification Prompt</label>
                    <textarea value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="Ex: Add fire particles..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-medium focus:ring-1 focus:ring-orange-500 h-32 resize-none outline-none" />
                  </div>
                  <button onClick={handleEditResult} disabled={isLoading || !editPrompt.trim() || !backgroundImage} className="w-full bg-zinc-800 hover:bg-orange-600 text-white font-black py-3 rounded-lg uppercase tracking-widest text-[10px] transition-all">Apply Changes</button>
                </div>
              )}

              {rightPanelTab === 'analyze' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="oswald text-xs font-bold uppercase text-zinc-500 tracking-widest">Vision Analysis</h3>
                  <ImageUploader onUpload={handleAnalyze} label="Upload for Analysis" />
                  {analysisResult && <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-[10px] text-zinc-400 whitespace-pre-wrap leading-relaxed border-l-2 border-orange-600">{analysisResult}</div>}
                </div>
              )}

              {rightPanelTab === 'history' && (
                <div className="space-y-4 animate-in fade-in duration-300 h-full">
                  <h3 className="oswald text-xs font-bold uppercase text-zinc-500 tracking-widest">Campaign Archive</h3>
                  <CampaignHistory onLoad={handleLoadCampaign} />
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {isLoading && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center gap-8">
          <div className="text-center space-y-4">
            <h3 className="oswald text-5xl font-bold uppercase tracking-[0.5em] text-white animate-pulse">SYNTHESIZING</h3>
            <p className="text-zinc-500 text-[14px] uppercase font-black tracking-[0.2em]">{loadingStage}</p>
          </div>
        </div>
      )}

      {/* Catalog Modal */}
      {showCatalog && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-8">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
            <button onClick={() => setShowCatalog(false)} className="absolute top-4 right-4 z-50 bg-zinc-800 hover:bg-zinc-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors">✕</button>
            <div className="p-8 h-full">
              <SkinCatalog onSelect={(s) => { setSelectedOfficialSkin(s); setSelectedGame('Counter-Strike'); setShowCatalog(false); }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
