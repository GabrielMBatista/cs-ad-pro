
import React from 'react';
import { Layer } from '../types';
import { WEIGHTS } from '../constants';

interface ControlPanelProps {
  layers: Layer[];
  selectedId: string | null;
  fonts: string[];
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onAddLayer: (type: 'text') => void;
  onDeleteLayer: (id: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  layers,
  selectedId,
  fonts,
  onUpdateLayer,
  onAddLayer,
  onDeleteLayer,
}) => {
  const selected = layers.find(l => l.id === selectedId);

  return (
    <div className="w-full bg-transparent p-1 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold oswald uppercase tracking-wider text-orange-500">Overlay Lab</h2>
      </div>

      {!selected ? (
        <div className="text-zinc-600 text-[10px] uppercase font-black text-center py-12 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/30">
          Select element on canvas<br />to adjust properties
        </div>
      ) : (
        <div className="space-y-6">

          {selected.type === 'text' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Message</label>
              <textarea
                value={selected.text}
                onChange={(e) => onUpdateLayer(selected.id, { text: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:ring-1 focus:ring-orange-500 outline-none h-24 resize-none"
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Opacidade</label>
              <span className="text-[10px] font-bold text-orange-500">{Math.round(selected.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={selected.opacity}
              onChange={(e) => onUpdateLayer(selected.id, { opacity: parseFloat(e.target.value) })}
              className="w-full accent-orange-600 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {(selected.type === 'text' && selected.style) && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Typeface</label>
                  <select
                    value={selected.style.fontFamily}
                    onChange={(e) => onUpdateLayer(selected.id, { style: { ...selected.style, fontFamily: e.target.value } })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs focus:outline-none"
                  >
                    {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Weight</label>
                  <select
                    value={selected.style.fontWeight}
                    onChange={(e) => onUpdateLayer(selected.id, { style: { ...selected.style, fontWeight: e.target.value } })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs focus:outline-none"
                  >
                    {WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Size</label>
                  <span className="text-[10px] font-bold text-orange-500">{selected.style.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="160"
                  value={selected.style.fontSize}
                  onChange={(e) => onUpdateLayer(selected.id, { style: { ...selected.style, fontSize: parseInt(e.target.value) } })}
                  className="w-full accent-orange-600 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Colorway</label>
                <div className="grid grid-cols-6 gap-2">
                  {['#ffffff', '#facc15', '#f97316', '#ef4444', '#8b5cf6', '#3b82f6'].map(c => (
                    <button
                      key={c}
                      onClick={() => onUpdateLayer(selected.id, { style: { ...selected.style, color: c } })}
                      className={`w-full aspect-square rounded border ${selected.style?.color === c ? 'border-white scale-110' : 'border-zinc-800'} transition-transform`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <div className="col-span-6 mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={selected.style.color}
                      onChange={(e) => onUpdateLayer(selected.id, { style: { ...selected.style, color: e.target.value } })}
                      className="w-full h-8 bg-zinc-950 border border-zinc-800 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Alignment</label>
                <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
                  {(['left', 'center', 'right'] as const).map(align => (
                    <button
                      key={align}
                      onClick={() => onUpdateLayer(selected.id, { style: { ...selected.style, textAlign: align } })}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-tighter transition-all ${selected.style?.textAlign === align ? 'bg-orange-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'}`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rotation</label>
              <span className="text-[10px] font-bold text-orange-500">{selected.rotation || 0}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={selected.rotation || 0}
              onChange={(e) => onUpdateLayer(selected.id, { rotation: parseInt(e.target.value) })}
              className="w-full accent-orange-600 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateLayer(selected.id, { scale: selected.scale + 0.1 })}
                className="bg-zinc-900 hover:bg-zinc-800 py-2 rounded text-[10px] font-bold uppercase"
              >
                Scale +
              </button>
              <button
                onClick={() => onUpdateLayer(selected.id, { scale: Math.max(0.1, selected.scale - 0.1) })}
                className="bg-zinc-900 hover:bg-zinc-800 py-2 rounded text-[10px] font-bold uppercase"
              >
                Scale -
              </button>
            </div>
          </div>


          <div className="pt-4 border-t border-zinc-800">
            <button
              onClick={() => onDeleteLayer(selected.id)}
              className="w-full bg-red-950/20 hover:bg-red-600 hover:text-white text-red-500 border border-red-900/30 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Destroy Element
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
