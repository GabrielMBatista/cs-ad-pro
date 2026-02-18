import React, { useEffect, useState, useRef } from 'react';
import { Campaign } from '../types';
import { getCampaigns, deleteCampaign, clearHistory } from '../services/historyService';

interface CampaignHistoryProps {
    onLoad: (campaign: Campaign) => void;
}

const CampaignHistory: React.FC<CampaignHistoryProps> = ({ onLoad }) => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    };

    const handleExport = () => {
        if (campaigns.length === 0) return alert('No history to export.');

        const dataStr = JSON.stringify(campaigns, (key, value) => {
            // Handle BigInt serialization if needed, though getCampaigns returns strings usually?
            // Prisma returns objects. Let's ensure safety.
            if (typeof value === 'bigint') return value.toString();
            return value;
        }, 2);

        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cs-ad-pro-history-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);

                if (!Array.isArray(json)) throw new Error('Invalid JSON format: Not an array');

                // Call bulk import API
                const response = await fetch('/api/campaigns/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(json)
                });

                if (!response.ok) throw new Error('Import failed');

                const result = await response.json();
                alert(`Import successful! ${result.count} campaigns restored.`);
                loadHistory();

            } catch (err: any) {
                console.error(err);
                alert('Error importing history: ' + err.message);
            } finally {
                setImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 shadow-xl min-h-[600px]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="oswald text-2xl font-bold uppercase text-orange-500">History</h2>
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        className="hidden"
                    />

                    <button
                        onClick={handleImportClick}
                        disabled={importing}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                        {importing ? 'Importing...' : 'Import JSON'}

                    </button>

                    <button
                        onClick={handleExport}
                        disabled={campaigns.length === 0}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                        Export JSON
                    </button>

                    {campaigns.length > 0 && (
                        <button onClick={handleClear} className="bg-red-900/20 hover:bg-red-900/40 text-red-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors border border-red-900/30">
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                    <p className="font-bold uppercase text-sm mb-2">No campaigns yet</p>
                    <p className="text-xs mb-4">Generate an ad to see it here.</p>
                    <button onClick={handleImportClick} className="text-orange-500 hover:underline text-xs">
                        Have a backup? Import JSON
                    </button>
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
                                    {new Date(Number(c.createdAt)).toLocaleDateString()}
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
