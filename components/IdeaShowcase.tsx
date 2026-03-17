import React from 'react';
import { SHOWCASE_IDEAS, ShowcaseItem } from '../services/showcaseData';

interface IdeaShowcaseProps {
    onSelect: (item: ShowcaseItem) => void;
}

const IdeaShowcase: React.FC<IdeaShowcaseProps> = ({ onSelect }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1 mb-4">
                <h3 className="oswald text-sm font-bold uppercase text-orange-500 tracking-wider">Expositor de Ideias</h3>
                <p className="text-[10px] text-zinc-500 uppercase font-black leading-tight">Inspire-se com composições épicas já criadas.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {SHOWCASE_IDEAS.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onSelect(item)}
                        className="group relative bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer hover:border-orange-500 transition-all active:scale-[0.98]"
                    >
                        {/* Image Preview */}
                        <div className="aspect-video relative overflow-hidden bg-zinc-900">
                            <img
                                src={item.imageUrl}
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                alt={item.title}
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                            {/* Badge */}
                            <div className="absolute top-3 left-3 px-2 py-0.5 bg-orange-600 rounded text-[8px] font-black uppercase text-white shadow-lg">
                                Idea Seed
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-2">
                            <h4 className="text-[11px] font-black uppercase text-white tracking-tight group-hover:text-orange-400 transition-colors">
                                {item.title}
                            </h4>
                            <p className="text-[9px] text-zinc-500 line-clamp-3 leading-relaxed font-medium italic">
                                "{item.prompt}"
                            </p>

                            <div className="pt-2 flex items-center justify-between">
                                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">Click to apply this vibe</span>
                                <div className="w-5 h-5 rounded-full border border-orange-500/30 flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 border border-dashed border-zinc-800 rounded-2xl text-center">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">More ideas coming soon...</p>
            </div>
        </div>
    );
};

export default IdeaShowcase;
