'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface Game {
    players: { playerId: string }[];
}

interface Fee {
    amount: number;
    description: string;
}

interface Debtor {
    name: string;
    owed: number;
    history?: {
        games: Game[];
        fees: Fee[];
    };
}

export default function CopyDebtButton({ debtors }: { debtors: Debtor[] }) {
    const [copied, setCopied] = useState(false);
    const [detailed, setDetailed] = useState(false);

    const handleCopy = async () => {
        if (!debtors || debtors.length === 0) return;

        // Format: Name: $Amount, Games Count, (Breakdown)
        const text = debtors
            .map(p => {
                // Round up to 2 decimal places
                const roundedOwed = Math.ceil(p.owed * 100) / 100;
                let line = `${p.name}: $${roundedOwed.toFixed(2)}`;

                if (detailed && p.history) {
                    const games = p.history.games;
                    const gameCount = games.length;

                    // Group games by player count
                    const breakdown: Record<number, number> = {};
                    games.forEach(g => {
                        const count = g.players.length;
                        breakdown[count] = (breakdown[count] || 0) + 1;
                    });

                    // Format breakdown string: "1 x 6 person game, 2 x 7 person game"
                    const breakdownParts = Object.entries(breakdown)
                        .map(([count, num]) => `${num} x ${count} person game`);

                    const breakdownStr = breakdownParts.join(', ');

                    // Check for fees/rego
                    const hasFees = p.history.fees.length > 0;
                    const feeText = hasFees ? ' + Rego/Fees' : '';

                    line += `, ${gameCount} game${gameCount === 1 ? '' : 's'}, (${breakdownStr}${feeText})`;
                }

                return line;
            })
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
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-2">
                <input
                    type="checkbox"
                    id="detailed-copy"
                    checked={detailed}
                    onChange={(e) => setDetailed(e.target.checked)}
                    className="rounded border-[hsl(var(--border))] bg-[hsl(var(--background))]"
                />
                <label htmlFor="detailed-copy" className="text-xs text-muted cursor-pointer">Detailed</label>
            </div>
            <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)] px-3 py-1.5 rounded-lg transition-colors"
                title="Copy list to clipboard"
            >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy List'}
            </button>
        </div>
    );
}
