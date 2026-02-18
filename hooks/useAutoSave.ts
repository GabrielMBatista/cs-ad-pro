
import { useEffect, useRef, useState } from 'react';
import { Campaign } from '../types';
import { saveCampaign } from '../services/historyService';

export const useAutoSave = (campaign: Partial<Campaign>, delay = 2000) => {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<number | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout>(null);
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        if (!campaign.id || !campaign.imageUrl) return; // Don't save empty/initial states

        setIsSaving(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(async () => {
            try {
                // Construct full campaign object to ensure type safety if needed
                // Assuming 'campaign' passed in has enough data or is the full state
                await saveCampaign(campaign as Campaign);
                setLastSaved(Date.now());
            } catch (error) {
                console.error("Auto-save failed", error);
            } finally {
                setIsSaving(false);
            }
        }, delay);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [campaign, delay]);

    return { isSaving, lastSaved };
};
