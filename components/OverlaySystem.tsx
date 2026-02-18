'use client';

import React, { useState, useEffect } from 'react';
import { CSGOSkin, TextOverlay } from '../types';
import { WEIGHTS } from '../constants';

interface OverlaySystemProps {
    skin: CSGOSkin | undefined;
    overlays: TextOverlay[];
    selectedId: string | null;
    fonts: string[];
    onOverlaysChange: (overlays: TextOverlay[]) => void;
    onUpdateOverlay: (id: string, updates: Partial<TextOverlay>) => void;
    onDeleteOverlay: (id: string) => void;
    compactMode?: boolean;
}

type TemplateType = 'minimal' | 'retail' | 'esports' | 'engagement' | 'postmatch' | 'versus';

const TEMPLATE_LABELS: Record<TemplateType, string> = {
    minimal: '🎯 Minimal',
    retail: '💰 Retail',
    esports: '🏆 Esports',
    engagement: '💬 Engagement',
    postmatch: '❓ Post-Match',
    versus: '⚔️ VS Float',
};

export const OverlaySystem: React.FC<OverlaySystemProps> = ({
    skin, overlays, selectedId, fonts,
    onOverlaysChange, onUpdateOverlay, onDeleteOverlay
}) => {
    const [template, setTemplate] = useState<TemplateType>('minimal');

    // Retail
    const [customPrice, setCustomPrice] = useState('');
    const [customFloat, setCustomFloat] = useState('0.001 FN');

    // Post-Match
    const [pmQuestion, setPmQuestion] = useState('E aí?');
    const [pmSub, setPmSub] = useState('Como foi\na partida?');

    // Versus
    const [vsTitle, setVsTitle] = useState('Float, Condition e Detalhe.');
    const [vsLabelA, setVsLabelA] = useState('LADO A');
    const [vsDescA, setVsDescA] = useState('Um pouco\ndesgastado...');
    const [vsLabelB, setVsLabelB] = useState('LADO B');
    const [vsDescB, setVsDescB] = useState('Perfeita!');

    // Engagement
    const [engQuestion, setEngQuestion] = useState('');
    const [engSub, setEngSub] = useState('Comenta a skin que pra você é mais top!');

    const selected = overlays.find(o => o.id === selectedId);

    useEffect(() => {
        if (!skin) return;

        let newOverlays: TextOverlay[] = [];
        const baseId = Date.now();
        const safeName = skin.name.toUpperCase();
        const weaponName = skin.weapon.name.toUpperCase();

        if (template === 'minimal') {
            newOverlays = [
                { id: `t-${baseId}-1`, text: safeName, x: 50, y: 90, fontSize: 42, color: '#ffffff', fontFamily: 'Oswald', fontWeight: '900', textAlign: 'center' },
                { id: `t-${baseId}-2`, text: weaponName, x: 50, y: 82, fontSize: 16, color: '#F97316', fontFamily: 'Inter', fontWeight: '700', textAlign: 'center' }
            ];
        } else if (template === 'retail') {
            newOverlays = [
                { id: `t-${baseId}-1`, text: safeName, x: 50, y: 15, fontSize: 32, color: '#ffffff', fontFamily: 'Oswald', fontWeight: '900', textAlign: 'center' },
                { id: `t-${baseId}-2`, text: customPrice || 'R$ 00,00', x: 85, y: 85, fontSize: 48, color: '#22c55e', fontFamily: 'Inter', fontWeight: '900', textAlign: 'right' },
                { id: `t-${baseId}-3`, text: `FLOAT: ${customFloat}`, x: 85, y: 92, fontSize: 12, color: '#cbd5e1', fontFamily: 'Inter', fontWeight: '500', textAlign: 'right' }
            ];
        } else if (template === 'esports') {
            newOverlays = [
                { id: `t-${baseId}-1`, text: 'OFFICIAL DROP', x: 50, y: 10, fontSize: 14, color: '#F97316', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center' },
                { id: `t-${baseId}-2`, text: safeName, x: 50, y: 50, fontSize: 64, color: 'rgba(255,255,255,0.1)', fontFamily: 'Oswald', fontWeight: '900', textAlign: 'center' }
            ];
        } else if (template === 'engagement') {
            const question = engQuestion || `E você, teria uma ${skin.weapon.name}?`;
            newOverlays = [
                { id: `t-${baseId}-1`, text: question, x: 50, y: 68, fontSize: 30, color: '#ffffff', fontFamily: 'Oswald', fontWeight: '900', textAlign: 'center' },
                { id: `t-${baseId}-2`, text: engSub, x: 50, y: 82, fontSize: 13, color: '#cbd5e1', fontFamily: 'Inter', fontWeight: '400', textAlign: 'center' },
                { id: `t-${baseId}-brand`, text: 'GMAX SKINS', x: 50, y: 93, fontSize: 11, color: '#8b5cf6', fontFamily: 'Oswald', fontWeight: '700', textAlign: 'center' }
            ];
        } else if (template === 'postmatch') {
            newOverlays = [
                { id: `t-${baseId}-1`, text: `? ${pmQuestion}`, x: 22, y: 20, rotation: -8, fontSize: 56, color: '#ffffff', fontFamily: 'Oswald', fontWeight: '900', textAlign: 'left' },
                { id: `t-${baseId}-2`, text: pmSub, x: 22, y: 42, rotation: -5, fontSize: 40, color: '#FACC15', fontFamily: 'Oswald', fontWeight: '900', textAlign: 'left' }
            ];
        } else if (template === 'versus') {
            newOverlays = [
                { id: `t-${baseId}-title`, text: vsTitle, x: 50, y: 8, fontSize: 22, color: '#ffffff', fontFamily: 'Inter', fontWeight: '700', textAlign: 'center' },
                { id: `t-${baseId}-la`, text: vsLabelA, x: 22, y: 28, fontSize: 22, color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center' },
                { id: `t-${baseId}-da`, text: vsDescA, x: 22, y: 40, fontSize: 14, color: '#cbd5e1', fontFamily: 'Inter', fontWeight: '400', textAlign: 'center' },
                { id: `t-${baseId}-vs`, text: 'VS', x: 50, y: 52, fontSize: 44, color: '#F97316', fontFamily: 'Oswald', fontWeight: '900', textAlign: 'center' },
                { id: `t-${baseId}-lb`, text: vsLabelB, x: 78, y: 28, fontSize: 22, color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center' },
                { id: `t-${baseId}-db`, text: vsDescB, x: 78, y: 40, fontSize: 14, color: '#FACC15', fontFamily: 'Inter', fontWeight: '700', textAlign: 'center' },
                { id: `t-${baseId}-brand`, text: 'GMAX SKINS', x: 50, y: 93, fontSize: 14, color: '#8b5cf6', fontFamily: 'Oswald', fontWeight: '700', textAlign: 'center' }
            ];
        }

        onOverlaysChange(newOverlays);
    }, [skin, template, customPrice, customFloat, pmQuestion, pmSub, vsTitle, vsLabelA, vsDescA, vsLabelB, vsDescB, engQuestion, engSub]);

    const inputCls = 'w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[11px] text-white outline-none focus:border-orange-600 transition-colors';

    return (
        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
            {/* Template Selector */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500">Template</label>
                <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(TEMPLATE_LABELS) as TemplateType[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setTemplate(t)}
                            className={`px-2 py-2 text-[9px] uppercase font-bold rounded border transition-all text-left ${template === t ? 'bg-orange-600 text-white border-orange-500' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}
                        >
                            {TEMPLATE_LABELS[t]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Template-specific inputs */}
            {template === 'retail' && (
                <div className="space-y-2 animate-in fade-in">
                    <label className="text-[10px] font-black uppercase text-zinc-500">Customizar</label>
                    <input type="text" placeholder="Preço (ex: R$ 1.200,00)" value={customPrice} onChange={e => setCustomPrice(e.target.value)} className={inputCls} />
                    <input type="text" placeholder="Float (ex: 0.001 FN)" value={customFloat} onChange={e => setCustomFloat(e.target.value)} className={inputCls} />
                </div>
            )}

            {template === 'postmatch' && (
                <div className="space-y-2 animate-in fade-in">
                    <label className="text-[10px] font-black uppercase text-zinc-500">Customizar</label>
                    <input type="text" placeholder="Pergunta (ex: E aí?)" value={pmQuestion} onChange={e => setPmQuestion(e.target.value)} className={inputCls} />
                    <textarea placeholder="Subtítulo" value={pmSub} onChange={e => setPmSub(e.target.value)} className={`${inputCls} h-16 resize-none`} />
                </div>
            )}

            {template === 'versus' && (
                <div className="space-y-2 animate-in fade-in">
                    <label className="text-[10px] font-black uppercase text-zinc-500">Customizar</label>
                    <input type="text" placeholder="Título" value={vsTitle} onChange={e => setVsTitle(e.target.value)} className={inputCls} />
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <span className="text-[9px] text-zinc-500 uppercase font-bold">Lado A</span>
                            <input type="text" placeholder="Label A" value={vsLabelA} onChange={e => setVsLabelA(e.target.value)} className={inputCls} />
                            <textarea placeholder="Descrição A" value={vsDescA} onChange={e => setVsDescA(e.target.value)} className={`${inputCls} h-14 resize-none`} />
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] text-zinc-500 uppercase font-bold">Lado B</span>
                            <input type="text" placeholder="Label B" value={vsLabelB} onChange={e => setVsLabelB(e.target.value)} className={inputCls} />
                            <textarea placeholder="Descrição B" value={vsDescB} onChange={e => setVsDescB(e.target.value)} className={`${inputCls} h-14 resize-none`} />
                        </div>
                    </div>
                </div>
            )}

            {template === 'engagement' && (
                <div className="space-y-2 animate-in fade-in">
                    <label className="text-[10px] font-black uppercase text-zinc-500">Customizar</label>
                    <textarea placeholder={`E você, teria uma ${skin?.weapon.name || 'skin'}?`} value={engQuestion} onChange={e => setEngQuestion(e.target.value)} className={`${inputCls} h-16 resize-none`} />
                    <input type="text" placeholder="Subtítulo" value={engSub} onChange={e => setEngSub(e.target.value)} className={inputCls} />
                </div>
            )}
        </div>
    );
};
