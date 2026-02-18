import { Campaign } from '../types';

export const saveCampaign = async (campaign: Campaign): Promise<void> => {
    const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save campaign');
    }

};

export const getCampaigns = async (): Promise<Campaign[]> => {
    try {
        const res = await fetch('/api/campaigns');
        if (!res.ok) throw new Error('Failed to fetch');
        return await res.json();
    } catch (e) {
        console.error('Failed to load history', e);
        return [];
    }
};

export const deleteCampaign = async (id: string): Promise<void> => {
    await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
};

export const clearHistory = async (): Promise<void> => {
    const campaigns = await getCampaigns();
    await Promise.all(campaigns.map((c) => deleteCampaign(c.id)));
};
