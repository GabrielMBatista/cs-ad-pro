
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Campaign } from '../types';

interface CampaignDB extends DBSchema {
    campaigns: {
        key: string;
        value: Campaign;
        indexes: { 'by-date': number };
    };
}

const DB_NAME = 'cs-ad-pro-db';
const STORE_NAME = 'campaigns';

async function getDB(): Promise<IDBPDatabase<CampaignDB>> {
    return openDB<CampaignDB>(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('by-date', 'createdAt');
            }
        },
    });
}

export const saveCampaign = async (campaign: Campaign): Promise<void> => {
    const db = await getDB();
    // Ensure createdAt is a number (it might be a BigInt from previous logic, but here we want number for sorting)
    const safeCampaign = {
        ...campaign,
        createdAt: Number(campaign.createdAt),
    };
    await db.put(STORE_NAME, safeCampaign);
};

export const getCampaigns = async (): Promise<Campaign[]> => {
    const db = await getDB();
    const campaigns = await db.getAllFromIndex(STORE_NAME, 'by-date');
    return campaigns.reverse(); // Newest first
};

export const deleteCampaign = async (id: string): Promise<void> => {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
};

export const clearHistory = async (): Promise<void> => {
    const db = await getDB();
    await db.clear(STORE_NAME);
};
