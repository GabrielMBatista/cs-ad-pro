'use client';

import React, { useState, useEffect } from 'react';

import { AppView, TextOverlay, ColorStyle, CSGOSkin, AspectRatio, ImageSize, WeaponTransform } from './types';
import { generateImage, editImage, analyzeImage, enhancePrompt } from './services/gemini';
import { findBestMatch } from './services/csgoApi';
import { generatePromptFromSkin } from './services/promptEngine';
import { compositeImage } from './services/canvasCompositor';
import { saveCampaign } from './services/historyService';
import ControlPanel from './components/ControlPanel';
import CanvasOverlay from './components/CanvasOverlay';
import { OverlaySystem } from './components/OverlaySystem';
import ImageUploader from './components/ImageUploader';
import SkinCatalog from './components/SkinCatalog';
import CampaignHistory from './components/CampaignHistory';
import QuickSkinSearch from './components/QuickSkinSearch';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('low quality, blurry, distorted, generic weapon, duplicate items, watermark, signature, text, logo, username, artist name, modified reference item, redraw, altered silhouette');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Layer State
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [weaponImage, setWeaponImage] = useState<string | undefined>(undefined);
  const [weaponTransform, setWeaponTransform] = useState<WeaponTransform>({ x: 50, y: 50, scale: 0.8, rotation: 0 });

  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [selectedOfficialSkin, setSelectedOfficialSkin] = useState<CSGOSkin | undefined>();
  const [leftTab, setLeftTab] = useState<'setup' | 'templates'>('setup');
  const [rightPanelTab, setRightPanelTab] = useState<'layers' | 'refine' | 'analyze' | 'history'>('layers');
  const [showCatalog, setShowCatalog] = useState(false);

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
          // Verify it's a valid image data string
          if (result.startsWith('data:image')) {
            resolve(result);
          } else {
            reject(new Error("Invalid image data"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    // Strategy 1: Weserv Proxy (Best for CORS)
    try {
      return await fetchAndConvert(`https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=png`);
    } catch (e) {
      console.warn("Weserv failed", e);
    }

    // Strategy 2: Direct Fetch (Works if CORS is open or Extension involved)
    try {
      return await fetchAndConvert(url);
    } catch (e) {
      console.warn("Direct fetch failed", e);
    }

    // Strategy 3: AllOrigins Proxy (Fallback)
    try {
      return await fetchAndConvert(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    } catch (e) {
      console.error("All strategies failed", e);
      throw new Error("Falha ao carregar imagem. Tente salvar a imagem e fazer upload manual.");
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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      let officialRef = selectedOfficialSkin;

      if (selectedGame === 'Counter-Strike' && !officialRef) {
        setLoadingStage("Auto-Lookup: Skin Catalog...");
        officialRef = (await findBestMatch(prompt)) || undefined;
        if (officialRef) setSelectedOfficialSkin(officialRef);
      }

      let referenceBase64 = undefined;
      if (officialRef?.image) {
        setLoadingStage("Prep: Multimodal Reference...");
        try {
          referenceBase64 = await imageUrlToBase64(officialRef.image);
        } catch (e: any) {
          console.error("Critical Reference Load Error", e);
          alert(`AVISO: ${e.message || "Erro ao carregar skin"}. O anúncio será gerado sem a arma.`);
        }
      }

      setLoadingStage(`Synthesis: Pixel-Lock Ad Creative...`);
      // If we have a reference, we DO NOT send it to Gemini for background generation
      // This prevents "ghost" items. We rely on the prompt context.

      const generatedBgUrl = await generateImage(prompt, selectedGame, aspectRatio, undefined, negativePrompt);

      setBackgroundImage(generatedBgUrl);

      if (officialRef?.image && referenceBase64) {
        setWeaponImage(referenceBase64);
        setWeaponTransform({ x: 50, y: 50, scale: 0.8, rotation: 0 }); // Reset to center
      } else {
        setWeaponImage(undefined);
      }

      // Save to History (We define the composite later or save separate layers?)
      // For now, let's save the background as the main image URL + metadata for reconstruction
      const newCampaign: import('./types').Campaign = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        skin: officialRef,
        prompt: prompt,
        imageUrl: generatedBgUrl, // Background is primarily saved
        overlays: overlays,
        status: 'draft'
      };

      // Smart Overlays 
      if (!officialRef) {
        const initialOverlays: import('./types').TextOverlay[] = [
          {
            id: 'initial',
            text: `AD CREATIVE`,
            fontSize: 32,
            color: selectedStyle.colors[0],
            x: 50,
            y: 85,
            fontFamily: fonts.includes('Oswald') ? 'Oswald' : fonts[0],
            fontWeight: '900',
            textAlign: 'center'
          }
        ];
        setOverlays(initialOverlays);
        newCampaign.overlays = initialOverlays;
      }

      await saveCampaign(newCampaign);

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Falha na síntese. Verifique sua chave API.");
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  const handleEdit = async () => {
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
      const result = await analyzeImage(image, `Analise esta imagem publicitária. O item central está integrado naturalmente ao cenário?`, useThinking);
      setAnalysisResult(result);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const addOverlay = () => {
    const newId = `text-${Date.now()}`;
    setOverlays(prev => [...prev, {
      id: newId, text: 'NIGHT DROP', fontSize: 32, color: selectedStyle.colors[0],
      x: 50, y: 50, fontFamily: fonts[0], fontWeight: '700', textAlign: 'center'
    }]);
    setSelectedOverlayId(newId);
  };

  const updateOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setOverlays(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const deleteOverlay = (id: string) => {
    setOverlays(prev => prev.filter(o => o.id !== id));
    setSelectedOverlayId(null);
  };

  const handleCustomRefUpload = (base64: string) => {
    const customSkin: CSGOSkin = {
      id: 'custom-' + Date.now(),
      name: 'Custom Reference',
      weapon: { id: 'custom', name: 'Sacred Subject' },
      rarity: { id: 'custom', name: 'Pixel Lock', color: '#ff00ff' },
      image: base64
    };
    setSelectedOfficialSkin(customSkin);
  };

  const handleReset = () => {
    if (confirm("Start a new ad? This will clear your current workspace.")) {
      setBackgroundImage('');
      setWeaponImage(undefined);
      setOverlays([]);
      setPrompt('');
      setSelectedOfficialSkin(undefined);
      setAnalysisResult('');
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
      // object-cover: fill canvas maintaining aspect ratio
      const bgAspect = bgImg.width / bgImg.height;
      let bx = 0, by = 0, bw = SIZE, bh = SIZE;
      if (bgAspect > 1) { bh = SIZE / bgAspect; by = (SIZE - bh) / 2; }
      else { bw = SIZE * bgAspect; bx = (SIZE - bw) / 2; }
      ctx.drawImage(bgImg, bx, by, bw, bh);

      // Layer 2: Weapon image (if present)
      if (weaponImage && weaponTransform) {
        const wImg = await loadImage(weaponImage);
        const wAspect = wImg.width / wImg.height;
        const drawW = weaponTransform.scale * SIZE;
        const drawH = drawW / wAspect;
        const cx = (weaponTransform.x / 100) * SIZE;
        const cy = (weaponTransform.y / 100) * SIZE;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((weaponTransform.rotation * Math.PI) / 180);
        // Drop shadow (matching CanvasOverlay)
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;
        ctx.drawImage(wImg, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      // Layer 3: Text overlays
      for (const overlay of overlays) {
        ctx.save();
        const tx = (overlay.x / 100) * SIZE;
        const ty = (overlay.y / 100) * SIZE;

        // Scale font size proportionally (canvas is SIZE px, CanvasOverlay is ~600px wide typically)
        const scaledFontSize = overlay.fontSize * (SIZE / 600);

        ctx.font = `${overlay.fontWeight} ${scaledFontSize}px ${overlay.fontFamily}`;
        ctx.fillStyle = overlay.color;
        ctx.textAlign = overlay.textAlign as CanvasTextAlign;
        ctx.textBaseline = 'middle';

        // Text shadow
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.translate(tx, ty);
        ctx.rotate(((overlay.rotation || 0) * Math.PI) / 180);

        // Handle multi-line text
        const lines = overlay.text.split('\n');
        const lineHeight = scaledFontSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        lines.forEach((line, i) => {
          ctx.fillText(line, 0, (i * lineHeight) - (totalHeight / 2) + lineHeight / 2);
        });

        ctx.restore();
      }

      // Trigger download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gmax-ad-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');

    } catch (err) {
      console.error('Download failed:', err);
      alert('Falha ao exportar. Verifique o console.');
    }
  };


  const handleLoadCampaign = (campaign: import('./types').Campaign) => {
    setBackgroundImage(campaign.imageUrl);
    setPrompt(campaign.prompt);
    if (campaign.skin) {
      setSelectedOfficialSkin(campaign.skin);
      // We ideally need the weapon transform saved too, but for now reset or try to load
      // If the skin image isn't base64 cached, we might need to refetch.
      // For this version, assumed logic:
      imageUrlToBase64(campaign.skin.image).then(b64 => setWeaponImage(b64));
    }
    setOverlays(campaign.overlays);
  };



  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-orange-500/30 overflow-hidden">
      <nav className="border-b border-zinc-800 bg-zinc-900/80 sticky top-0 z-50 backdrop-blur-md px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center font-black text-2xl skew-x-[-10deg] shadow-lg shadow-orange-900/20">G</div>
          <span className="oswald text-xl font-bold tracking-tighter uppercase">CS <span className="text-orange-600">AD-PRO</span></span>
        </div>

        <div className="hidden md:flex gap-2">
          <button onClick={handleReset} className="px-4 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
            + New Ad
          </button>
        </div>

        <div className="flex items-center gap-4">
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
            <div className="bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden shrink-0">
              {/* Left Tabs */}
              <div className="grid grid-cols-2 p-1 gap-1 bg-zinc-950/50 rounded-t-xl">
                <button
                  onClick={() => setLeftTab('setup')}
                  className={`py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${leftTab === 'setup' ? 'bg-zinc-800 text-orange-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Setup
                </button>
                <button
                  onClick={() => setLeftTab('templates')}
                  className={`py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${leftTab === 'templates' ? 'bg-zinc-800 text-orange-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Templates
                </button>
              </div>

              <div className="p-4 space-y-4">
                {leftTab === 'setup' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
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
                  <div className="animate-in fade-in duration-300">
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-center">
                      <p className="text-[10px] text-zinc-500 mb-2">Select a Layout Template</p>
                      {selectedOfficialSkin ? (
                        <OverlaySystem
                          skin={selectedOfficialSkin}
                          overlays={overlays}
                          selectedId={selectedOverlayId}
                          fonts={fonts}
                          onOverlaysChange={setOverlays}
                          onUpdateOverlay={updateOverlay}
                          onDeleteOverlay={deleteOverlay}
                        />
                      ) : (
                        <p className="text-[9px] text-zinc-600 italic">Select a skin first to view templates</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-xl relative overflow-hidden flex-1 flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <h3 className="oswald text-xs font-bold uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-600"></span> Subject & Prompt
                <button onClick={() => setShowCatalog(true)} className="ml-auto text-[9px] text-orange-500 hover:text-orange-400 font-bold uppercase tracking-wider border border-orange-600/30 px-2 py-0.5 rounded hover:bg-orange-600/10 transition-colors">
                  + Browse Catalog
                </button>
              </h3>

              <QuickSkinSearch onSelect={(s) => { setSelectedOfficialSkin(s); setSelectedGame('Counter-Strike'); }} />

              {selectedOfficialSkin && (
                <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-orange-600/40 shadow-inner group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img src={selectedOfficialSkin.image} className="w-16 h-16 object-contain bg-zinc-900 rounded-lg shadow-sm z-10" />
                  <div className="flex-1 min-w-0 z-10">
                    <h4 className="text-[10px] font-black uppercase text-orange-400 truncate">{selectedOfficialSkin.name}</h4>
                    <div className="flex gap-2 items-center mt-1">
                      <button onClick={() => setSelectedOfficialSkin(undefined)} className="text-[8px] font-bold text-zinc-500 hover:text-white transition-colors">REMOVE</button>
                      <span className="text-[7px] font-black bg-orange-600 px-1.5 py-0.5 rounded text-white uppercase shadow-sm">LOCKED</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black text-zinc-400 uppercase">Scenario Description</label>
                  <button onClick={handleAutoPrompt} disabled={isEnhancing || !prompt.trim()} className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-orange-600/10 text-orange-400 border border-orange-600/20 hover:bg-orange-600 hover:text-white transition-all">
                    {isEnhancing ? 'Optimizing...' : '✨ Enhance'}
                  </button>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the desired background (e.g., Neon City Streets)..."
                  className="w-full flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-medium focus:ring-1 focus:ring-orange-500 resize-none outline-none shadow-inner min-h-[100px]"
                />
              </div>

              <div className="pt-2">
                <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg shadow-orange-900/30 active:scale-95 group overflow-hidden relative">
                  <span className="relative z-10">{isLoading ? 'Synthesizing...' : 'GENERATE AD CAMPAIGN'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: CANVAS (6 cols) */}
          <div className="col-span-6 flex flex-col gap-4 h-full relative">
            <div className="flex-1 bg-zinc-900/30 rounded-3xl border border-zinc-800 flex items-center justify-center p-8 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <CanvasOverlay
                image={backgroundImage}
                weaponImage={weaponImage}
                weaponTransform={weaponTransform}
                onWeaponTransformChange={setWeaponTransform}
                overlays={overlays}
                selectedId={selectedOverlayId}
                onSelect={setSelectedOverlayId}
                onUpdateOverlay={updateOverlay}
              />
            </div>

            {backgroundImage && (
              <div className="absolute bottom-6 right-6 flex gap-2">
                <button onClick={handleDownload} className="bg-zinc-950 hover:bg-white hover:text-black text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all border border-zinc-800 shadow-2xl flex items-center gap-2">
                  Download Result
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: TOOLS (3 cols) */}
          <div className="col-span-3 flex flex-col gap-0 bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden min-h-0">

            {/* Tool Tabs */}
            <div className="flex border-b border-zinc-800">
              {(['layers', 'refine', 'analyze', 'history'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setRightPanelTab(t)}
                  className={`flex-1 py-3 text-[9px] font-black uppercase tracking-wider transition-colors ${rightPanelTab === t ? 'bg-zinc-800 text-orange-500 border-b-2 border-orange-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 min-h-0">

              {rightPanelTab === 'layers' && (
                <div className="space-y-4 animate-in fade-in duration-300">

                  {/* Selected Item Context Info */}
                  {selectedOverlayId === 'weapon' && (
                    <div className="p-3 bg-orange-900/20 border border-orange-600/30 rounded-lg">
                      <h3 className="oswald text-xs font-bold uppercase text-orange-500 tracking-widest mb-2">Weapon Reference</h3>
                      <div className="grid grid-cols-2 gap-2 text-[9px]">
                        <div className="space-y-1">
                          <span className="block text-zinc-500">Scale</span>
                          <input
                            type="range" min="0.1" max="2" step="0.1"
                            value={weaponTransform.scale}
                            onChange={(e) => setWeaponTransform(t => ({ ...t, scale: parseFloat(e.target.value) }))}
                            className="w-full accent-orange-600 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="block text-zinc-500">Rotation</span>
                          <input
                            type="range" min="-180" max="180"
                            value={weaponTransform.rotation}
                            onChange={(e) => setWeaponTransform(t => ({ ...t, rotation: parseFloat(e.target.value) }))}
                            className="w-full accent-orange-600 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <h3 className="oswald text-xs font-bold uppercase text-zinc-500 tracking-widest">Text Elements</h3>
                  {selectedOverlayId && selectedOverlayId !== 'weapon' ? (
                    <div className="p-1">
                      <ControlPanel
                        overlays={overlays} selectedId={selectedOverlayId} fonts={fonts}
                        onUpdateOverlay={updateOverlay} onAddOverlay={addOverlay} onDeleteOverlay={deleteOverlay}
                      />
                    </div>
                  ) : (
                    <div className="text-center p-8 border border-dashed border-zinc-800 rounded-xl">
                      <p className="text-zinc-500 text-[10px]">Select text on canvas <br />or <br />Select weapon to edit transform</p>
                      <button onClick={addOverlay} className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold transition-colors">
                        + Add Text Layer
                      </button>
                    </div>
                  )}
                </div>
              )}

              {rightPanelTab === 'refine' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="oswald text-xs font-bold uppercase text-zinc-500 tracking-widest">AI In-Painting</h3>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-400 uppercase">Modification Prompt</label>
                    <textarea value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="Ex: Add fire particles..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-medium focus:ring-1 focus:ring-orange-500 h-32 resize-none outline-none" />
                  </div>
                  <button onClick={handleEdit} disabled={isLoading || !editPrompt.trim() || !backgroundImage} className="w-full bg-zinc-800 hover:bg-orange-600 text-white font-black py-3 rounded-lg uppercase tracking-widest text-[10px] transition-all">
                    Apply Changes
                  </button>
                </div>
              )}

              {rightPanelTab === 'analyze' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="oswald text-xs font-bold uppercase text-zinc-500 tracking-widest">Vision Analysis</h3>
                  <ImageUploader onUpload={handleAnalyze} label="Upload for Analysis" />
                  {analysisResult && (
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-[10px] text-zinc-400 whitespace-pre-wrap leading-relaxed border-l-2 border-orange-600">
                      {analysisResult}
                    </div>
                  )}
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
          <div className="relative">
            <div className="w-32 h-32 border-4 border-orange-500/5 border-t-orange-600 rounded-full animate-spin shadow-2xl shadow-orange-900/40"></div>
            <div className="absolute inset-0 flex items-center justify-center font-black text-4xl text-orange-600 tracking-tighter">G</div>
          </div>
          <div className="text-center space-y-4">
            <h3 className="oswald text-5xl font-bold uppercase tracking-[0.5em] text-white animate-pulse">SYNTHESIZING</h3>
            <div className="flex items-center justify-center gap-3">
              <span className="w-3 h-3 bg-orange-600 rounded-full animate-ping"></span>
              <p className="text-zinc-500 text-[14px] uppercase font-black tracking-[0.2em]">{loadingStage}</p>
            </div>
          </div>
          <div className="mt-12 px-10 py-6 bg-zinc-900 rounded-3xl border border-zinc-800 max-w-lg text-center shadow-2xl border-t-orange-600/20">
            <p className="text-[11px] text-zinc-400 uppercase font-black leading-loose tracking-widest">
              MULTIMODAL PIXEL-LOCK IN PROGRESS:<br />
              <span className="text-zinc-600">Preserving absolute truth of source material while reconstructing environmental reality.</span>
            </p>
          </div>
        </div>
      )}

      {/* Catalog Modal */}
      {showCatalog && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-8">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
            <button
              onClick={() => setShowCatalog(false)}
              className="absolute top-4 right-4 z-50 bg-zinc-800 hover:bg-zinc-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors"
            >
              ✕
            </button>
            <div className="p-8 h-full">
              <SkinCatalog onSelect={(s) => {
                setSelectedOfficialSkin(s);
                setSelectedGame('Counter-Strike');
                setShowCatalog(false);
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
