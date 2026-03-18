'use client';

import React from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

interface Notification {
    id: string;
    type: NotificationType;
    title?: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface NotificationSystemProps {
    notifications: Notification[];
    onClose: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onClose }) => {
    if (notifications.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="space-y-4 max-w-md w-full">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 overflow-hidden relative animate-in zoom-in-95 duration-200"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-600" />

                        <div className="space-y-4">
                            <div className="space-y-1">
                                {n.title && (
                                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">
                                        {n.title}
                                    </h3>
                                )}
                                <p className="text-zinc-100 font-medium leading-relaxed">
                                    {n.message}
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                {(n.type === 'confirm') && (
                                    <button
                                        onClick={() => {
                                            if (n.onCancel) n.onCancel();
                                            onClose(n.id);
                                        }}
                                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all border border-transparent hover:border-zinc-700"
                                    >
                                        Cancelar
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (n.onConfirm) n.onConfirm();
                                        onClose(n.id);
                                    }}
                                    className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-900/20 transition-all active:scale-95"
                                >
                                    {n.type === 'confirm' ? 'Confirmar' : 'OK'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
