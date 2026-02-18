
import React from 'react';
import { TextOverlay } from '../types';
import { WEIGHTS } from '../constants';

interface ControlPanelProps {
  overlays: TextOverlay[];
  selectedId: string | null;
  fonts: string[];
  onUpdateOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  onAddOverlay: () => void;
  onDeleteOverlay: (id: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  overlays,
  selectedId,
  fonts,
  onUpdateOverlay,
  onAddOverlay,
  onDeleteOverlay,
}) => {
  const selected = overlays.find(o => o.id === selectedId);

  return (
    <div className="w-full bg-transparent p-1 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold oswald uppercase tracking-wider text-orange-500">Overlay Lab</h2>
        <button
          onClick={onAddOverlay}
          className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1 rounded text-[10px] font-black uppercase transition-colors"
        >
          + Add Text
        </button>
      </div>

      {!selected ? (
        <div className="text-zinc-600 text-[10px] uppercase font-black text-center py-12 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/30">
          Select element on canvas<br />to adjust properties
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Message</label>
            <textarea
              value={selected.text}
              onChange={(e) => onUpdateOverlay(selected.id, { text: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:ring-1 focus:ring-orange-500 outline-none h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Typeface</label>
              <select
                value={selected.fontFamily}
                onChange={(e) => onUpdateOverlay(selected.id, { fontFamily: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs focus:outline-none"
              >
                {fonts.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Weight</label>
              <select
                value={selected.fontWeight}
                onChange={(e) => onUpdateOverlay(selected.id, { fontWeight: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs focus:outline-none"
              >
                {WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Scale</label>
              <span className="text-[10px] font-bold text-orange-500">{selected.fontSize}px</span>
            </div>
            <input
              type="range"
              min="8"
              max="160"
              value={selected.fontSize}
              onChange={(e) => onUpdateOverlay(selected.id, { fontSize: parseInt(e.target.value) })}
              className="w-full accent-orange-600 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

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
              onChange={(e) => onUpdateOverlay(selected.id, { rotation: parseInt(e.target.value) })}
              className="w-full accent-orange-600 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Colorway</label>
            <div className="grid grid-cols-6 gap-2">
              {['#ffffff', '#facc15', '#f97316', '#ef4444', '#8b5cf6', '#3b82f6'].map(c => (
                <button
                  key={c}
                  onClick={() => onUpdateOverlay(selected.id, { color: c })}
                  className={`w-full aspect-square rounded border ${selected.color === c ? 'border-white scale-110' : 'border-zinc-800'} transition-transform`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <div className="col-span-6 mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={selected.color}
                  onChange={(e) => onUpdateOverlay(selected.id, { color: e.target.value })}
                  className="w-full h-8 bg-zinc-950 border border-zinc-800 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Paragraph</label>
            <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
              {(['left', 'center', 'right'] as const).map(align => (
                <button
                  key={align}
                  onClick={() => onUpdateOverlay(selected.id, { textAlign: align })}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-tighter transition-all ${selected.textAlign === align ? 'bg-orange-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'}`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <button
              onClick={() => onDeleteOverlay(selected.id)}
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
