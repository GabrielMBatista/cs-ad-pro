
import React, { useState, useEffect, useRef } from 'react';
import { searchSkins } from '../services/csgoApi';
import { CSGOSkin } from '../types';

interface QuickSkinSearchProps {
    onSelect: (skin: CSGOSkin) => void;
}

const QuickSkinSearch: React.FC<QuickSkinSearchProps> = ({ onSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CSGOSkin[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            const data = await searchSkins(query);
            setResults(data);
            setIsLoading(false);
            setIsOpen(true);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (skin: CSGOSkin) => {
        onSelect(skin);
        setQuery('');
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative z-50 w-full">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim() && setIsOpen(true)}
                    placeholder="Quick Search Skin (ex: Asiimov, Fade...)"
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white placeholder-zinc-600 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-all shadow-lg backdrop-blur-sm"
                />
                {isLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="h-4 w-4 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute mt-2 w-full bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar">
                    <div className="p-2 grid gap-1">
                        {results.map(skin => (
                            <button
                                key={skin.id}
                                onClick={() => handleSelect(skin)}
                                className="flex items-center gap-3 w-full p-2 hover:bg-white/5 rounded-lg text-left transition-colors group"
                            >
                                <img src={skin.image} alt={skin.name} className="w-10 h-10 object-contain bg-black/40 rounded-md border border-zinc-800" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-white uppercase truncate">{skin.name}</span>
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 group-hover:border-orange-500/50 transition-colors">
                                            {skin.weapon.name}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuickSkinSearch;
