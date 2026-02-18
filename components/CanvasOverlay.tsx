
import React, { useRef, useState, useEffect } from 'react';
import { TextOverlay, WeaponTransform } from '../types';

interface CanvasOverlayProps {
  image: string; // This is now the BACKGROUND image
  weaponImage?: string; // The separate weapon layer
  weaponTransform?: WeaponTransform;
  onWeaponTransformChange?: (t: WeaponTransform) => void;
  overlays: TextOverlay[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdateOverlay: (id: string, updates: Partial<TextOverlay>) => void;
}

const CanvasOverlay: React.FC<CanvasOverlayProps> = ({
  image,
  weaponImage,
  weaponTransform,
  onWeaponTransformChange,
  overlays,
  selectedId,
  onSelect,
  onUpdateOverlay,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingItem, setDraggingItem] = useState<{ type: 'text' | 'weapon', id?: string } | null>(null);

  const handleMouseDown = (e: React.MouseEvent, type: 'text' | 'weapon', id?: string) => {
    e.stopPropagation();
    if (type === 'text' && id) onSelect(id);
    if (type === 'weapon') onSelect('weapon');
    setDraggingItem({ type, id });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingItem || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (draggingItem.type === 'text' && draggingItem.id) {
      onUpdateOverlay(draggingItem.id, { x, y });
    } else if (draggingItem.type === 'weapon' && onWeaponTransformChange && weaponTransform) {
      // For weapon, x/y is center based
      onWeaponTransformChange({ ...weaponTransform, x, y });
    }
  };

  const handleMouseUp = () => {
    setDraggingItem(null);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[1/1] bg-zinc-950 rounded-lg overflow-hidden shadow-2xl shadow-black group cursor-crosshair border border-zinc-800"
      onMouseMove={handleMouseMove}
      onClick={() => onSelect('')}
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

      {/* 2. Weapon Layer (Interactive) */}
      {weaponImage && weaponTransform && (
        <img
          src={weaponImage}
          alt="Weapon"
          onMouseDown={(e) => handleMouseDown(e, 'weapon')}
          onClick={(e) => { e.stopPropagation(); onSelect('weapon'); }}
          className={`absolute select-none cursor-move transition-shadow duration-200 z-20 ${selectedId === 'weapon' ? 'drop-shadow-[0_0_15px_rgba(255,80,0,0.8)] filter brightness-110' : 'hover:filter hover:brightness-110'}`}
          style={{
            left: `${weaponTransform.x}%`,
            top: `${weaponTransform.y}%`,
            width: `${weaponTransform.scale * 100}%`,
            transform: `translate(-50%, -50%) rotate(${weaponTransform.rotation}deg)`,
            transformOrigin: 'center center'
          }}
        />
      )}

      {/* 3. Text Overlays */}
      {overlays.map((overlay) => (
        <div
          key={overlay.id}
          onMouseDown={(e) => handleMouseDown(e, 'text', overlay.id)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(overlay.id);
          }}
          className={`absolute cursor-move select-none whitespace-pre-wrap transition-shadow duration-200 z-30
            ${selectedId === overlay.id ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-zinc-900 rounded-sm' : 'hover:ring-1 hover:ring-zinc-500'}`}
          style={{
            left: `${overlay.x}%`,
            top: `${overlay.y}%`,
            transform: `translate(-${overlay.textAlign === 'center' ? '50' : overlay.textAlign === 'right' ? '100' : '0'}%, -50%) rotate(${overlay.rotation || 0}deg)`,
            color: overlay.color,
            fontSize: `${overlay.fontSize}px`,
            fontFamily: overlay.fontFamily,
            fontWeight: overlay.fontWeight,
            textAlign: overlay.textAlign,
            maxWidth: '80%',
            lineHeight: 1.2,
            textShadow: '2px 2px 4px rgba(0,0,0,0.9), -1px -1px 0 rgba(0,0,0,0.5)',
          }}
        >
          {overlay.text}
        </div>
      ))}
    </div>
  );
};

export default CanvasOverlay;
