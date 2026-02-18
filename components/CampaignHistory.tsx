
import React, { useEffect, useState } from 'react';
import { Campaign, CSGOSkin, TextOverlay } from '../types';
import { getCampaigns, deleteCampaign, clearHistory } from '../services/historyService';

interface CampaignHistoryProps {
    onLoad: (campaign: Campaign) => void;
}

const CampaignHistory: React.FC<CampaignHistoryProps> = ({ onLoad }) => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    const loadHistory = async () => {
        const data = await getCampaigns();
        setCampaigns(data);
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this campaign?')) {
            await deleteCampaign(id);
            loadHistory();
        }
    };

    const handleClear = async () => {
        if (confirm('Clear ALL history? This cannot be undone.')) {
            await clearHistory();
            loadHistory();
        }
    }

    return (
        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 shadow-xl min-h-[600px]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="oswald text-2xl font-bold uppercase text-orange-500">Campaign History</h2>
                {campaigns.length > 0 && (
                    <button onClick={handleClear} className="text-[10px] font-black uppercase text-red-500 hover:text-red-400">
                        Clear All
                    </button>
                )}
            </div>

            {campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-zinc-600">
                    <p className="font-bold uppercase text-sm">No campaigns yet</p>
                    <p className="text-xs">Generate an ad to see it here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {campaigns.map(c => (
                        <div
                            key={c.id}
                            onClick={() => onLoad(c)}
                            className="group relative aspect-[4/5] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 hover:border-orange-500 cursor-pointer transition-all hover:scale-[1.02]"
                        >
                            <img src={c.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
                                <h4 className="text-[10px] font-black text-white uppercase truncate">
                                    {c.skin?.name || "Ad Campaign"}
                                </h4>
                                <p className="text-[8px] text-zinc-400 font-mono">
                                    {new Date(c.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <button
                                onClick={(e) => handleDelete(c.id, e)}
                                className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-red-600/80 rounded flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all font-bold text-xs"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CampaignHistory;
