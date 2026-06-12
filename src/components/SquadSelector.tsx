'use client';

import { useState } from 'react';
import { Users, Target, Filter } from 'lucide-react';

interface Player {
    id: string;
    name: string;
    gamesPlayedCount: number;
}

export default function SquadSelector({ players }: { players: Player[] }) {
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const [goals, setGoals] = useState<Record<string, string>>({});
    const [filterSelected, setFilterSelected] = useState(false);

    const handleCheckboxChange = (playerId: string, checked: boolean) => {
        if (checked) {
            setCheckedIds(prev => [...prev, playerId]);
        } else {
            setCheckedIds(prev => prev.filter(id => id !== playerId));
            // Reset goals for unchecked players
            setGoals(prev => {
                const updated = { ...prev };
                delete updated[playerId];
                return updated;
            });
        }
    };

    const handleGoalsChange = (playerId: string, value: string) => {
        setGoals(prev => ({
            ...prev,
            [playerId]: value
        }));
    };

    const totalGoals = Object.values(goals).reduce((sum, val) => {
        const num = parseInt(val);
        return sum + (isNaN(num) ? 0 : num);
    }, 0);

    const displayedPlayers = filterSelected
        ? players.filter(p => checkedIds.includes(p.id))
        : players;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted">Squad & Goals</label>
                
                {/* Dynamic update indicator styled as a button */}
                <button
                    type="button"
                    onClick={() => {
                        if (checkedIds.length > 0) {
                            setFilterSelected(!filterSelected);
                        }
                    }}
                    disabled={checkedIds.length === 0}
                    className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                        ${checkedIds.length === 0 
                            ? 'bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed'
                            : filterSelected
                                ? 'bg-[hsl(var(--secondary)/0.2)] text-[hsl(var(--secondary))] border-[hsl(var(--secondary)/0.4)] hover:bg-[hsl(var(--secondary)/0.3)]'
                                : 'bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.3)]'
                        }
                    `}
                >
                    <span className="flex items-center gap-1">
                        <Users size={12} /> {checkedIds.length} Selected
                    </span>
                    <span className="text-muted/50">|</span>
                    <span className="flex items-center gap-1">
                        <Target size={12} /> {totalGoals} Goal{totalGoals === 1 ? '' : 's'}
                    </span>
                    {checkedIds.length > 0 && (
                        <>
                            <span className="text-muted/50">|</span>
                            <span className="flex items-center gap-1 text-[10px] uppercase font-semibold">
                                <Filter size={10} /> {filterSelected ? 'Show All' : 'Review'}
                            </span>
                        </>
                    )}
                </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto p-2 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--background)/0.5)] custom-scrollbar">
                {players.length === 0 ? (
                    <p className="text-xs text-muted text-center py-2">No players found. Add players first.</p>
                ) : displayedPlayers.length === 0 ? (
                    <p className="text-xs text-muted text-center py-8">
                        {filterSelected ? 'No selected players to show.' : 'No players match.'}
                    </p>
                ) : (
                    displayedPlayers.map(player => {
                        const isChecked = checkedIds.includes(player.id);
                        return (
                            <div 
                                key={player.id} 
                                className={`
                                    flex items-center justify-between gap-2 p-2 rounded-lg transition-colors group
                                    ${isChecked ? 'bg-[hsl(var(--primary)/0.05)] border-l-2 border-[hsl(var(--primary))] pl-1.5' : 'hover:bg-[hsl(var(--accent))]'}
                                `}
                            >
                                <label className="flex items-center gap-3 cursor-pointer flex-1 py-1">
                                    <input 
                                        type="checkbox" 
                                        name="players" 
                                        value={player.id} 
                                        checked={isChecked}
                                        onChange={(e) => handleCheckboxChange(player.id, e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))] bg-[hsl(var(--background))]" 
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">{player.name}</span>
                                        <span className="text-[10px] text-muted-foreground">{player.gamesPlayedCount} game{player.gamesPlayedCount === 1 ? '' : 's'} played</span>
                                    </div>
                                </label>
                                
                                <div className={`flex items-center gap-1 transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0 pointer-events-none group-hover:opacity-40'}`}>
                                    <span className="text-[10px] uppercase text-muted font-bold">Goals:</span>
                                    <input
                                        type="number"
                                        name={`goals-${player.id}`}
                                        min="0"
                                        value={goals[player.id] || ''}
                                        onChange={(e) => handleGoalsChange(player.id, e.target.value)}
                                        placeholder="0"
                                        disabled={!isChecked}
                                        className="w-12 p-1 text-xs rounded bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-center focus:border-[hsl(var(--primary))] outline-none font-bold tabular-nums"
                                    />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
