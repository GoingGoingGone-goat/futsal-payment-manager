'use client';

import { useState, useEffect } from 'react';
import { PenLine } from 'lucide-react';

interface OpponentNotesProps {
    teamName: string;
}

export default function OpponentNotes({ teamName }: OpponentNotesProps) {
    const [note, setNote] = useState<string>('');
    const [mounted, setMounted] = useState<boolean>(false);

    const storageKey = `futsal_notes_${teamName.toLowerCase().trim()}`;

    useEffect(() => {
        setMounted(true);
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                setNote(saved);
            }
        } catch {
            // Ignore browser storage restrictions
        }
    }, [storageKey]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setNote(val);
        try {
            localStorage.setItem(storageKey, val);
        } catch {
            // Ignore browser storage restrictions
        }
    };

    return (
        <div className="glass-card px-3.5 py-2 rounded-xl border border-[hsl(var(--border))] focus-within:border-[hsl(var(--primary)/0.5)] transition-colors flex items-center gap-2.5">
            <PenLine size={14} className="text-muted shrink-0" />
            <input
                type="text"
                value={mounted ? note : ''}
                onChange={handleChange}
                placeholder="Add notes on opponent (e.g. Blue jerseys, old guys, spanish)..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-muted/50 outline-none"
            />
        </div>
    );
}
