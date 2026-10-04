'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
    Shield, 
    ArrowUpDown, 
    Search, 
    Flame, 
    ChevronRight, 
    Calendar, 
    SlidersHorizontal,
    Trophy,
    Info
} from 'lucide-react';
import { 
    getOpponentLadder, 
    getDifficultyCategory,
    getConfidenceStyle,
    type OpponentDifficultyStats 
} from '@/lib/difficulty';
import type { Game } from '@/lib/storage';

type SortOption = 
    | 'hardest' 
    | 'easiest' 
    | 'most_played' 
    | 'best_record' 
    | 'worst_record' 
    | 'best_gd'
    | 'worst_gd';

interface OpponentLadderProps {
    initialGames: Game[];
    availableSeasons: string[];
    currentDefaultSeason?: string;
}

export default function OpponentLadder({ 
    initialGames, 
    availableSeasons,
    currentDefaultSeason = 'Season 6'
}: OpponentLadderProps) {
    const [selectedSeason, setSelectedSeason] = useState<string>('All');
    const [sortBy, setSortBy] = useState<SortOption>('hardest');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Compute ladder for current season filter using the shared calculation utility
    const ladder = useMemo(() => {
        return getOpponentLadder(initialGames, selectedSeason);
    }, [initialGames, selectedSeason]);

    // Apply sorting and search filter
    const displayedOpponents = useMemo(() => {
        let list = [...ladder];

        // Search query filter
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            list = list.filter(opp => opp.name.toLowerCase().includes(query));
        }

        // Sorting
        list.sort((a, b) => {
            switch (sortBy) {
                case 'hardest':
                    // Default ladder rank (difficultyScore DESC)
                    return b.difficultyScore - a.difficultyScore;
                case 'easiest':
                    // Easiest first (difficultyScore ASC)
                    return a.difficultyScore - b.difficultyScore;
                case 'most_played':
                    // Most games played
                    return b.gamesPlayed - a.gamesPlayed || b.difficultyScore - a.difficultyScore;
                case 'best_record':
                    // Best record for our team (resultRate DESC)
                    return b.resultRate - a.resultRate || b.gdPerGame - a.gdPerGame;
                case 'worst_record':
                    // Worst record for our team (resultRate ASC)
                    return a.resultRate - b.resultRate || a.gdPerGame - b.gdPerGame;
                case 'best_gd':
                    // Highest GD/G for us
                    return b.gdPerGame - a.gdPerGame;
                case 'worst_gd':
                    // Lowest GD/G for us
                    return a.gdPerGame - b.gdPerGame;
                default:
                    return b.difficultyScore - a.difficultyScore;
            }
        });

        return list;
    }, [ladder, sortBy, searchQuery]);

    // Summary insights
    const hardestOpponent = ladder.length > 0 ? ladder[0] : null;
    const totalH2HMatches = useMemo(() => {
        const relevantGames = selectedSeason === 'All' 
            ? initialGames 
            : initialGames.filter(g => g.season === selectedSeason);
        return relevantGames.length;
    }, [initialGames, selectedSeason]);

    return (
        <div className="space-y-6">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-4 rounded-xl border border-[hsl(var(--border))]">
                    <div className="text-xs text-muted font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Shield size={14} className="text-[hsl(var(--primary))]" />
                        Opponents Faced
                    </div>
                    <div className="text-2xl font-bold">{ladder.length}</div>
                    <div className="text-xs text-muted mt-0.5">
                        Across {totalH2HMatches} match{totalH2HMatches === 1 ? '' : 'es'} ({selectedSeason === 'All' ? 'All Time' : selectedSeason})
                    </div>
                </div>

                <div className="glass-card p-4 rounded-xl border border-[hsl(var(--border))]">
                    <div className="text-xs text-muted font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Flame size={14} className="text-red-400" />
                        Hardest Opponent
                    </div>
                    <div className="text-2xl font-bold truncate">
                        {hardestOpponent ? hardestOpponent.name : '—'}
                    </div>
                    <div className="text-xs text-muted mt-0.5 flex items-center gap-1.5">
                        {hardestOpponent ? (
                            <>
                                <span className="font-semibold text-red-400">{hardestOpponent.displayDifficulty.toFixed(1)} / 10</span>
                                <span>•</span>
                                <span>{hardestOpponent.confidenceLabel} Confidence ({hardestOpponent.gamesPlayed}G)</span>
                            </>
                        ) : (
                            'No opponent data'
                        )}
                    </div>
                </div>

                <div className="glass-card p-4 rounded-xl border border-[hsl(var(--border))]">
                    <div className="text-xs text-muted font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Info size={14} className="text-[hsl(var(--secondary))]" />
                        Difficulty Baseline
                    </div>
                    <div className="text-2xl font-bold flex items-baseline gap-1">
                        5.0 <span className="text-xs text-muted font-normal">/ 10 = Even</span>
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                        &gt; 5.0 = Tough Matchup • &lt; 5.0 = Favourable
                    </div>
                </div>
            </div>

            {/* Filter and Sorting Controls */}
            <div className="glass-card p-4 sm:p-5 rounded-2xl border border-[hsl(var(--border))] space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Time / Season Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                        <span className="text-xs font-bold text-muted uppercase tracking-wider mr-1 hidden sm:inline">
                            Season:
                        </span>
                        <button
                            type="button"
                            onClick={() => setSelectedSeason('All')}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                                selectedSeason === 'All'
                                    ? 'bg-[hsl(var(--primary))] text-black shadow-md'
                                    : 'bg-[hsl(var(--background)/0.6)] text-muted hover:text-white border border-[hsl(var(--border))]'
                            }`}
                        >
                            All Time
                        </button>
                        {availableSeasons.map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setSelectedSeason(s)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                                    selectedSeason === s
                                        ? 'bg-[hsl(var(--primary))] text-black shadow-md'
                                        : 'bg-[hsl(var(--background)/0.6)] text-muted hover:text-white border border-[hsl(var(--border))]'
                                }`}
                            >
                                {s === currentDefaultSeason ? `${s} (Current)` : s}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative min-w-[200px] md:w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by opponent..."
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] outline-none text-white placeholder:text-muted"
                        />
                    </div>
                </div>

                {/* Sort Option Buttons / Dropdown */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[hsl(var(--border))] text-xs">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal size={14} className="text-muted" />
                        <span className="text-muted font-medium">Sort By:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg px-2.5 py-1 text-xs text-white focus:border-[hsl(var(--primary))] outline-none cursor-pointer"
                        >
                            <option value="hardest">Hardest → Easiest (Default)</option>
                            <option value="easiest">Easiest → Hardest</option>
                            <option value="most_played">Most Played</option>
                            <option value="best_record">Best H2H Record</option>
                            <option value="worst_record">Worst H2H Record</option>
                            <option value="best_gd">Goal Difference/Game (Highest)</option>
                            <option value="worst_gd">Goal Difference/Game (Lowest)</option>
                        </select>
                    </div>

                    <div className="text-muted text-[11px]">
                        Showing {displayedOpponents.length} of {ladder.length} opponents
                    </div>
                </div>
            </div>

            {/* Opponent Difficulty Ladder Table */}
            {displayedOpponents.length === 0 ? (
                <div className="glass-card p-12 rounded-2xl text-center text-muted">
                    {searchQuery ? `No opponents matching "${searchQuery}" in ${selectedSeason === 'All' ? 'All Time' : selectedSeason}.` : 'No games recorded for this season yet.'}
                </div>
            ) : (
                <div className="glass-card rounded-2xl overflow-hidden border border-[hsl(var(--border))] shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[hsl(var(--accent))] text-muted uppercase text-[11px] font-bold tracking-wider border-b border-[hsl(var(--border))]">
                                    <th className="py-3.5 px-4 text-center w-12">#</th>
                                    <th className="py-3.5 px-4 min-w-[180px]">Opponent</th>
                                    <th className="py-3.5 px-4 min-w-[210px]">Difficulty</th>
                                    <th className="py-3.5 px-4 text-center min-w-[110px]">Record</th>
                                    <th className="py-3.5 px-4 text-center min-w-[90px]">GD / G</th>
                                    <th className="py-3.5 px-4 min-w-[150px]">Recent Form</th>
                                    <th className="py-3.5 px-4 text-center min-w-[120px]">Confidence</th>
                                    <th className="py-3.5 px-3 w-8"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[hsl(var(--border))] text-sm">
                                {displayedOpponents.map((opp) => {
                                    const cat = getDifficultyCategory(opp.displayDifficulty);
                                    
                                    // Visual bar calculation (0 to 10 mapped to 0% to 100%)
                                    const scorePct = Math.min(100, Math.max(0, (opp.difficultyScore / 10) * 100));

                                    // Form badges
                                    const formBadges = opp.recentForm;

                                    return (
                                        <tr 
                                            key={opp.name}
                                            className="hover:bg-[hsl(var(--accent)/0.5)] transition-colors group cursor-pointer"
                                        >
                                            {/* Ladder Position / Rank */}
                                            <td className="py-4 px-4 text-center font-bold">
                                                {opp.rank === 1 ? (
                                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black shadow-sm">
                                                        #1
                                                    </span>
                                                ) : opp.rank === 2 ? (
                                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                                                        #2
                                                    </span>
                                                ) : opp.rank === 3 ? (
                                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/30 text-xs font-bold">
                                                        #3
                                                    </span>
                                                ) : (
                                                    <span className="text-muted font-medium text-xs">
                                                        #{opp.rank}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Opponent Name */}
                                            <td className="py-4 px-4">
                                                <Link 
                                                    href={`/teams/${encodeURIComponent(opp.name)}`}
                                                    prefetch={true}
                                                    className="text-base sm:text-lg font-bold text-white group-hover:text-[hsl(var(--primary))] transition-colors block"
                                                >
                                                    {opp.name}
                                                </Link>
                                            </td>

                                            {/* Difficulty Score + Indicator Bar */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2.5 mb-1.5">
                                                    <span className="text-lg font-black tracking-tight tabular-nums">
                                                        {opp.displayDifficulty.toFixed(1)}
                                                    </span>
                                                    <span className="text-xs text-muted font-medium">/ 10</span>
                                                    
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${cat.bgClass} ${cat.colorClass} ${cat.borderClass}`}>
                                                        {cat.label}
                                                    </span>
                                                </div>

                                                {/* Visual Difficulty Bar (0 to 10 with 5.0 neutral center notch) */}
                                                <div className="w-full max-w-[190px]">
                                                    <div className="relative h-2 rounded-full bg-slate-800 border border-slate-700/60 overflow-hidden">
                                                        {/* Center neutral marker at 5.0 (50%) */}
                                                        <div 
                                                            className="absolute top-0 bottom-0 w-0.5 bg-slate-500/80 z-10" 
                                                            style={{ left: '50%' }}
                                                            title="5.0 Neutral Midpoint"
                                                        />

                                                        {/* Dynamic colored fill bar */}
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-300 ${
                                                                opp.displayDifficulty > 6.0 
                                                                    ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                                                                    : opp.displayDifficulty >= 4.0 
                                                                        ? 'bg-gradient-to-r from-green-500 to-amber-500' 
                                                                        : 'bg-gradient-to-r from-emerald-500 to-green-500'
                                                            }`}
                                                             style={{ width: `${scorePct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Head-to-Head Record */}
                                            <td className="py-4 px-4 text-center">
                                                <div className="inline-flex items-center gap-2 font-bold text-sm sm:text-base bg-[hsl(var(--background)/0.6)] px-3 py-1.5 rounded-lg border border-[hsl(var(--border))]">
                                                    <span className="text-emerald-400" title="Wins">{opp.wins}W</span>
                                                    <span className="text-slate-400" title="Draws">{opp.draws}D</span>
                                                    <span className="text-rose-400" title="Losses">{opp.losses}L</span>
                                                </div>
                                            </td>

                                            {/* GD per Game */}
                                            <td className="py-4 px-4 text-center tabular-nums">
                                                <span className={`font-bold text-base sm:text-lg ${
                                                    opp.gdPerGame > 0 
                                                        ? 'text-emerald-400' 
                                                        : opp.gdPerGame < 0 
                                                            ? 'text-rose-400' 
                                                            : 'text-slate-300'
                                                }`}>
                                                    {opp.gdPerGame > 0 ? `+${opp.gdPerGame.toFixed(2)}` : opp.gdPerGame.toFixed(2)}
                                                </span>
                                            </td>

                                            {/* Recent Form (up to 5, newest to oldest reading left to right) */}
                                            <td className="py-4 px-4">
                                                {formBadges.length === 0 ? (
                                                    <span className="text-xs text-muted">—</span>
                                                ) : (
                                                    <div className="flex items-center gap-1.5">
                                                        {formBadges.map((res, i) => (
                                                            <span
                                                                key={i}
                                                                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-xs sm:text-sm font-black uppercase border shadow-sm ${
                                                                    res === 'W'
                                                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                                        : res === 'L'
                                                                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                                                            : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                                                                }`}
                                                                title={res === 'W' ? 'Win' : res === 'L' ? 'Loss' : 'Draw'}
                                                            >
                                                                {res}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Confidence */}
                                            <td className="py-4 px-4 text-center">
                                                {(() => {
                                                    const confStyle = getConfidenceStyle(opp.confidenceLabel);
                                                    return (
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-bold border ${confStyle.bgClass} ${confStyle.colorClass} ${confStyle.borderClass}`}>
                                                            {opp.confidenceLabel}
                                                        </span>
                                                    );
                                                })()}
                                            </td>

                                            {/* Link Chevron */}
                                            <td className="py-4 pr-4 pl-1 text-right">
                                                <Link 
                                                    href={`/teams/${encodeURIComponent(opp.name)}`}
                                                    prefetch={true}
                                                    className="p-1.5 rounded-lg text-muted group-hover:text-white group-hover:bg-[hsl(var(--accent))] transition-colors inline-block"
                                                    title={`View matches vs ${opp.name}`}
                                                >
                                                    <ChevronRight size={18} />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
