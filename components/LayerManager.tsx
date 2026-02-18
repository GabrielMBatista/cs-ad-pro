
import React, { useRef } from 'react';
import { Layer } from '../types';

interface LayerManagerProps {
    layers: Layer[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
    onReorderLayers: (newOrder: Layer[]) => void;
    onDeleteLayer: (id: string) => void;
    onAddLayer: (type: 'text' | 'image' | 'sticker', src?: string) => void;
}

const LayerManager: React.FC<LayerManagerProps> = ({
    layers,
    selectedId,
    onSelect,
    onUpdateLayer,
    onReorderLayers,
    onDeleteLayer,
    onAddLayer
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            onAddLayer('image', result);
        };
        reader.readAsDataURL(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const moveLayer = (index: number, direction: 'up' | 'down') => {
        const newLayers = [...layers];
        if (direction === 'up') {
            if (index === newLayers.length - 1) return; // Already top
            // Swap current with next (higher z-index)
            // Note: Visual list is usually Top (high z) -> Bottom (low z), but array is 0..N
            // If we render list reversed (top visual = last in array), then 'up' means moving towards end of array.
            // Let's assume array order = z-index order (0 is background, N is top).
            // "Move Up" = index + 1
            [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
        } else {
            if (index === 0) return; // Already bottom
            // "Move Down" = index - 1
            [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
        }
        // Reassign z-indexes explicitly just in case
        newLayers.forEach((l, i) => l.zIndex = i);
        onReorderLayers(newLayers);
    };

    // We want to display highest z-index at the top of the list
    const displayLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

    return (
        <div className="space-y-4">
            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => onAddLayer('text')}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-colors"
                >
                    <span>T</span> Add Text
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-colors"
                >
                    <span>🖼️</span> Add Image
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                />
            </div>

            {/* Layer List */}
            <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {displayLayers.length === 0 && (
                    <p className="text-center text-[10px] text-zinc-600 italic py-4">No layers added</p>
                )}

                {displayLayers.map((layer) => (
                    <div
                        key={layer.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer group
              ${selectedId === layer.id ? 'bg-orange-900/10 border-orange-500/50' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}
                        onClick={() => onSelect(layer.id)}
                    >
                        {/* Type Icon */}
                        <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center text-xs shrink-0 text-zinc-500 font-mono">
                            {layer.type === 'text' ? 'T' : 'IMG'}
                        </div>

                        {/* Content Preview */}
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-zinc-300 truncate">
                                {layer.type === 'text' ? (layer.text || 'Text Layer') : 'Image Layer'}
                            </p>
                            <p className="text-[8px] text-zinc-600 font-mono">z-{layer.zIndex}</p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Visibility */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onUpdateLayer(layer.id, { visible: !layer.visible }); }}
                                className={`w-5 h-5 flex items-center justify-center rounded hover:bg-zinc-800 ${layer.visible ? 'text-zinc-400' : 'text-zinc-700'}`}
                                title="Toggle Visibility"
                            >
                                {layer.visible ? '👁️' : '🚫'}
                            </button>

                            {/* Move Up/Down (Remember displayLayers is reversed) */}
                            <div className="flex flex-col gap-0.5">
                                <button
                                    onClick={(e) => { e.stopPropagation(); moveLayer(layer.zIndex, 'up'); }}
                                    className="h-2.5 w-4 bg-zinc-800 hover:bg-orange-600 rounded-sm flex items-center justify-center text-[6px]"
                                >▲</button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); moveLayer(layer.zIndex, 'down'); }}
                                    className="h-2.5 w-4 bg-zinc-800 hover:bg-orange-600 rounded-sm flex items-center justify-center text-[6px]"
                                >▼</button>
                            </div>

                            {/* Delete */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeleteLayer(layer.id); }}
                                className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-900/30 text-zinc-600 hover:text-red-500 transition-colors"
                                title="Delete Layer"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LayerManager;
