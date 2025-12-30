'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface Debtor {
    name: string;
    owed: number;
}

export default function CopyDebtButton({ debtors }: { debtors: Debtor[] }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!debtors || debtors.length === 0) return;

        // Format: Name $Amount
        const text = debtors
            .map(d => `${d.name} $${d.owed.toFixed(0)}`) // Rounding to nearest dollar as requested (e.g., $5)
            .join('\n');

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (debtors.length === 0) return null;

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)] px-3 py-1.5 rounded-lg transition-colors"
            title="Copy list to clipboard"
        >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy List'}
        </button>
    );
}
