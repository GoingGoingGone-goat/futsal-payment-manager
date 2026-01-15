'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface Game {
    players: { playerId: string }[];
    season: string;
    costPerPlayer: number;
    date: string;
}

interface Fee {
    amount: number;
    description: string;
    season: string;
    date: string;
}

interface Payment {
    amount: number;
    season: string;
}

interface Debtor {
    name: string;
    owed: number;
    history?: {
        games: Game[];
        fees: Fee[];
        payments: Payment[];
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
                    // 1. Filter to Season 3 (Target Scope)
                    const s3Games = p.history.games.filter(g => g.season === 'Season 3' || !g.season);
                    const s3Fees = p.history.fees.filter(f => f.season === 'Season 3' || !f.season);
                    const s3Payments = p.history.payments?.filter(py => py.season === 'Season 3' || !py.season) || [];

                    const totalPaid = s3Payments.reduce((sum, py) => sum + py.amount, 0);

                    // 2. Sort Costs Chronologically (Oldest -> Newest)
                    // We assume payments cover the oldest debts first
                    const allCosts = [
                        ...s3Games.map(g => ({ type: 'game' as const, amount: g.costPerPlayer, date: g.date, data: g })),
                        ...s3Fees.map(f => ({ type: 'fee' as const, amount: f.amount, date: f.date, data: f }))
                    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                    // 3. Pay off items
                    let remainingPayment = totalPaid;
                    const unpaidItems: typeof allCosts = [];

                    for (const cost of allCosts) {
                        if (remainingPayment >= cost.amount - 1.0) {
                            // Fully paid (with $1.00 tolerance for rounding/overpayment weirdness)
                            remainingPayment -= cost.amount;
                        } else {
                            // Partially paid or Unpaid
                            if (remainingPayment > 0) {
                                // Used up the last of the payment
                                remainingPayment = 0;
                            }
                            unpaidItems.push(cost);
                        }
                    }

                    // 4. Group Unpaid Items
                    const unpaidGames = unpaidItems.filter(i => i.type === 'game').map(i => i.data as Game);
                    const unpaidFees = unpaidItems.filter(i => i.type === 'fee');

                    const gameCount = unpaidGames.length;

                    // Breakdown string
                    const parts = [];

                    // Games Breakdown
                    if (gameCount > 0) {
                        const breakdown: Record<number, number> = {};
                        unpaidGames.forEach(g => {
                            const count = g.players.length;
                            breakdown[count] = (breakdown[count] || 0) + 1;
                        });

                        const gameParts = Object.entries(breakdown)
                            .map(([count, num]) => `${num} x ${count} person game`);
                        parts.push(...gameParts);
                    }

                    // Fees Breakdown
                    if (unpaidFees.length > 0) {
                        parts.push('Rego/Fees');
                    }

                    // Fallback for misc rounding mismatch if we have debt but no items
                    if (parts.length === 0 && roundedOwed > 1) {
                        parts.push('Misc/Rounding');
                    }

                    if (parts.length > 0) {
                        line += `, ${gameCount} game${gameCount === 1 ? '' : 's'}, (${parts.join(', ')})`;
                    }
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
