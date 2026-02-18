
import React, { useRef, useState, useEffect } from 'react';
import { Layer } from '../types';

interface CanvasOverlayProps {
  image: string; // Background
  layers: Layer[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
}

const CanvasOverlay: React.FC<CanvasOverlayProps> = ({
  image,
  layers,
  selectedId,
  onSelect,
  onUpdateLayer,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent, id: string, initialX: number, initialY: number) => {
    e.stopPropagation();
    onSelect(id);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentMouseX = ((e.clientX - rect.left) / rect.width) * 100;
      const currentMouseY = ((e.clientY - rect.top) / rect.height) * 100;
      setDragOffset({
        x: currentMouseX - initialX,
        y: currentMouseY - initialY
      });
    }
    setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !containerRef.current || !dragOffset) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;

    const newX = mouseX - dragOffset.x;
    const newY = mouseY - dragOffset.y;

    onUpdateLayer(draggingId, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDraggingId(null);
    setDragOffset(null);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Sort layers by zIndex for rendering order
  const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[1/1] bg-zinc-950 rounded-lg overflow-hidden shadow-2xl shadow-black group cursor-crosshair border border-zinc-800"
      onMouseMove={handleMouseMove}
      onClick={() => onSelect(null)}
    >
      {/* 1. Background Layer (AI) */}
      {image ? (
        <img
          src={image}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-600 italic text-sm uppercase tracking-widest font-bold">
          No Signal
        </div>
      )}

      {/* 2. Unified Layers (Images & Text) */}
      {sortedLayers.map((layer) => (
        <React.Fragment key={layer.id}>
          {layer.visible && (
            <div
              onMouseDown={(e) => handleMouseDown(e, layer.id, layer.x, layer.y)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(layer.id);
              }}
              className={`absolute cursor-move select-none transition-none
                    ${selectedId === layer.id ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-zinc-900 rounded-sm z-[9999]' : 'hover:ring-1 hover:ring-zinc-500'}`}
              style={{
                left: `${layer.x}%`,
                top: `${layer.y}%`,
                transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scale(${layer.scale})`,
                zIndex: layer.zIndex,
                opacity: layer.opacity,
                ...((layer.type === 'text' && layer.style) ? {
                  color: layer.style.color,
                  fontSize: `${layer.style.fontSize}px`,
                  fontFamily: layer.style.fontFamily,
                  fontWeight: layer.style.fontWeight,
                  textAlign: layer.style.textAlign,
                  textShadow: layer.style.shadow ? '2px 2px 4px rgba(0,0,0,0.9)' : 'none',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.2,
                  width: 'max-content',
                  maxWidth: '80%'
                } : {
                  width: '300px', // Standard reference size matching export logic
                  maxWidth: '50%'
                })
              }}
            >
              {layer.type === 'image' || layer.type === 'sticker' ? (
                <img
                  src={layer.src}
                  className="w-full h-full object-contain pointer-events-none"
                />
              ) : (
                layer.text
              )}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CanvasOverlay;
