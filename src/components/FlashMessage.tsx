'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export function FlashMessage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const msg = searchParams.get('msg');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (msg) {
            setIsVisible(true);
            // Hide after 3 seconds
            const timer = setTimeout(() => {
                handleDismiss();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [msg]);

    const handleDismiss = () => {
        setIsVisible(false);
        // Clear the query param without refreshing
        const nextSearchParams = new URLSearchParams(searchParams.toString());
        nextSearchParams.delete('msg');
        router.replace(`${pathname}?${nextSearchParams.toString()}`);
    };

    if (!isVisible || !msg) return null;

    let text = "Operation successful";
    if (msg === 'player_deleted') text = "Player deleted successfully.";
    if (msg === 'game_deleted') text = "Game deleted successfully.";
    if (msg === 'payment_deleted') text = "Payment deleted successfully.";

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
            <div className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
                <CheckCircle2 size={20} />
                <span className="font-medium text-sm">{text}</span>
                <button
                    onClick={handleDismiss}
                    className="ml-2 hover:bg-black/10 p-1 rounded-full transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
