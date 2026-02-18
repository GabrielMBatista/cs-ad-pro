
import React, { useState, useEffect } from 'react';
import { searchSkins } from '../services/csgoApi';
import { CSGOSkin } from '../types';

interface SkinCatalogProps {
  onSelect: (skin: CSGOSkin) => void;
}

const SkinCatalog: React.FC<SkinCatalogProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [skins, setSkins] = useState<CSGOSkin[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const results = await searchSkins(query);
      setSkins(results);
      setIsLoading(false);
    };
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest oswald">Oficial CS:GO Catalog</label>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skin or weapon (ex: Howl, Dragon Lore...)"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs font-medium focus:ring-1 focus:ring-orange-500 outline-none"
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pr-2 custom-scrollbar">
        {skins.length === 0 && !isLoading && (
          <div className="col-span-2 text-center py-12 text-zinc-600 uppercase font-black text-[10px]">
            No official skins found
          </div>
        )}
        {skins.map(skin => (
          <div 
            key={skin.id}
            onClick={() => onSelect(skin)}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 flex flex-col gap-2 cursor-pointer hover:border-orange-500/50 transition-all group"
          >
            <div className="aspect-video bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center relative">
               <img src={skin.image} alt={skin.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
               <div 
                className="absolute bottom-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: skin.rarity.color || '#fff' }}
               />
            </div>
            <div className="space-y-1">
              <h4 className="text-[9px] font-black text-zinc-200 uppercase truncate" title={skin.name}>
                {skin.name}
              </h4>
              <div className="flex justify-between items-center">
                <span className="text-[7px] font-bold text-zinc-500 uppercase">{skin.weapon.name}</span>
                <span className="text-[7px] font-black uppercase px-1 rounded bg-zinc-800 text-zinc-400" style={{ color: skin.rarity.color }}>
                  {skin.rarity.name}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkinCatalog;
