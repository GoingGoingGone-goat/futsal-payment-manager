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

type CopyMode = 'simple' | 'summary' | 'detailed';

export default function CopyDebtButton({ debtors }: { debtors: Debtor[] }) {
    const [copied, setCopied] = useState(false);
    const [mode, setMode] = useState<CopyMode>('simple');

    const handleCopy = async () => {
        if (!debtors || debtors.length === 0) return;

        const totalOutstanding = debtors.reduce((sum, p) => sum + p.owed, 0);

        // Header
        let text = `Total Outstanding: $${totalOutstanding.toFixed(2)}\n\n`;

        // Format: Name: $Amount, Games Count, (Breakdown)
        const listText = debtors
            .map(p => {
                // Round up to 2 decimal places
                const roundedOwed = Math.ceil(p.owed * 100) / 100;
                let line = `${p.name}: $${roundedOwed.toFixed(2)}`;

                // Calculate Logic if not simple
                if (mode !== 'simple' && p.history) {
                    // 1. Filter to Season 3 (Target Scope)
                    const s3Games = p.history.games.filter(g => g.season === 'Season 3' || !g.season);
                    const s3Fees = p.history.fees.filter(f => f.season === 'Season 3' || !f.season);
                    const s3Payments = p.history.payments?.filter(py => py.season === 'Season 3' || !py.season) || [];

                    const totalPaid = s3Payments.reduce((sum, py) => sum + py.amount, 0);

                    // 2. Sort Costs: FEES FIRST, then Chronological
                    // This ensures partial payments cover Rego/Fees before Games, leaving Games as the "Unpaid" items.
                    const allCosts = [
                        ...s3Fees.map(f => ({ type: 'fee' as const, amount: f.amount, date: f.date, data: f })),
                        ...s3Games.map(g => ({ type: 'game' as const, amount: g.costPerPlayer, date: g.date, data: g }))
                    ].sort((a, b) => {
                        if (a.type !== b.type) {
                            return a.type === 'fee' ? -1 : 1; // Fees first
                        }
                        return new Date(a.date).getTime() - new Date(b.date).getTime(); // Then chronological
                    });

                    // 3. Pay off items
                    let remainingPayment = totalPaid;
                    const unpaidItems: typeof allCosts = [];

                    for (const cost of allCosts) {
                        if (remainingPayment >= cost.amount - 1.0) {
                            remainingPayment -= cost.amount;
                        } else {
                            if (remainingPayment > 0) remainingPayment = 0;
                            unpaidItems.push(cost);
                        }
                    }

                    // 4. Group Unpaid Items
                    let unpaidGames = unpaidItems.filter(i => i.type === 'game').map(i => i.data as Game);
                    const unpaidFees = unpaidItems.filter(i => i.type === 'fee');

                    // 5. Fallback: Closest Match
                    // If we have distinct debt but logic says "0 games", maybe it's a single specific game with a weird cost match
                    if (unpaidGames.length === 0 && roundedOwed > 5 && s3Games.length > 0) {
                        // Find a game cost that is very close to the owed amount
                        const closestGame = s3Games.reduce((prev, curr) => {
                            return (Math.abs(curr.costPerPlayer - roundedOwed) < Math.abs(prev.costPerPlayer - roundedOwed) ? curr : prev);
                        });

                        // If match is within $1.50, assume it's that game
                        if (Math.abs(closestGame.costPerPlayer - roundedOwed) < 1.50) {
                            unpaidGames = [closestGame];
                        }
                    }

                    const gameCount = unpaidGames.length;

                    // --- Construct String Based on Mode ---

                    if (mode === 'summary') {
                        // Format: Name: $Amount, X Games + any rego
                        line += `, ${gameCount} game${gameCount === 1 ? '' : 's'}`;
                        if (unpaidFees.length > 0) {
                            line += ' + any rego';
                        }
                    } else if (mode === 'detailed') {
                        // Format: Name: $Amount, X Games, (Breakdown + any rego)

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

                        // Fees Breakdown Marker (Actual string constuction happens below)
                        if (unpaidFees.length > 0) {
                            parts.push('any rego');
                        }

                        // Fallback for misc
                        if (parts.length === 0 && roundedOwed > 1) {
                            parts.push('Misc');
                        }

                        if (parts.length > 0) {
                            const gamePartStr = parts.filter(p => p !== 'any rego' && p !== 'Misc').join(', ');
                            const hasRego = unpaidFees.length > 0;

                            let breakdownStr = gamePartStr;
                            if (hasRego) {
                                breakdownStr += breakdownStr ? ' + any rego' : 'any rego';
                            }
                            if (parts.includes('Misc') && !hasRego && !gamePartStr) {
                                breakdownStr = 'Misc';
                            } else if (parts.includes('Misc') && (hasRego || gamePartStr)) {
                                // Optional: Add + Misc if desired, user didn't explicitly ask but good for completeness
                                // For now keeping it clean as per "less detailed" request logic applied to detailed
                                breakdownStr += ' + Misc';
                            }

                            line += `, ${gameCount} game${gameCount === 1 ? '' : 's'}, (${breakdownStr})`;
                        }
                    }
                }

                return line;
            })
            .join(mode === 'detailed' ? '\n\n' : '\n'); // Double newline only for detailed

        text += listText;

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
                <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as CopyMode)}
                    className="h-7 text-xs rounded border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 focus:ring-1 focus:ring-[hsl(var(--primary))]"
                >
                    <option value="simple">Simple</option>
                    <option value="summary">Summary</option>
                    <option value="detailed">Detailed</option>
                </select>
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
