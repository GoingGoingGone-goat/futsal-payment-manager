'use client';

import { useState, useMemo } from 'react';
import { Target, Trophy, Shield, Crown, Zap, Flame, Users, DollarSign } from 'lucide-react';
import { getAdvancedStats, getSynergyStats } from '@/lib/analytics';
import type { Schema } from '@/lib/storage';

interface AnalyticsDashboardProps {
    initialData: Schema;
    availableSeasons: string[];
}

export default function AnalyticsDashboard({ initialData, availableSeasons }: AnalyticsDashboardProps) {
    const [currentSeason, setCurrentSeason] = useState<string>('All');
    const [currentMinGames, setCurrentMinGames] = useState<number>(3);
    const [currentSynergySize, setCurrentSynergySize] = useState<number>(3);

    // Instant in-memory computation
    const stats = useMemo(() => {
        return getAdvancedStats(initialData, currentSeason, currentMinGames);
    }, [initialData, currentSeason, currentMinGames]);

    const synergy = useMemo(() => {
        return getSynergyStats(initialData, currentSeason, currentMinGames, currentSynergySize);
    }, [initialData, currentSeason, currentMinGames, currentSynergySize]);

    const Leaderboard = ({ 
        title, 
        icon: Icon, 
        data, 
        prefix = '',
        suffix = '', 
        precision = 0, 
        description, 
        showSign = false 
    }: {
        title: string;
        icon: any;
        data: { id: string; name: string; value: number }[];
        prefix?: string;
        suffix?: string;
        precision?: number;
        description: string;
        showSign?: boolean;
    }) => (
        <div className="glass-card p-6 rounded-2xl flex flex-col h-full max-h-[500px]">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-[hsl(var(--secondary)/0.1)] text-[hsl(var(--secondary))]">
                    <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold">{title}</h3>
            </div>

            <p className="text-lg text-muted mb-4 min-h-[60px] leading-tight">{description}</p>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {data.map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <span className={`
                                w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0
                                ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                    index === 1 ? 'bg-slate-400/20 text-slate-400' :
                                        index === 2 ? 'bg-orange-700/20 text-orange-700' : 'text-muted'}
                            `}>
                                {index + 1}
                            </span>
                            <span className="font-medium group-hover:text-[hsl(var(--primary))] transition-colors truncate max-w-[120px]">
                                {player.name}
                            </span>
                        </div>
                        <span className={`font-bold tabular-nums shrink-0 ${showSign && player.value > 0 ? 'text-green-500' : showSign && player.value < 0 ? 'text-red-500' : ''}`}>
                            {showSign && player.value > 0 ? '+' : ''}{prefix}{player.value.toFixed(precision)}{suffix}
                        </span>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="text-center text-muted text-sm py-8">
                        Not enough data
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Analytics</h1>
                        <p className="text-muted">Advanced player performance metrics.</p>
                    </div>

                    {/* Season Filter Tabs - Instant 0 ms switching */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setCurrentSeason('All')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                currentSeason === 'All'
                                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary)/0.3)]'
                                    : 'bg-[hsl(var(--accent))] text-muted-foreground hover:bg-[hsl(var(--accent)/0.8)] hover:text-foreground'
                            }`}
                        >
                            All Time
                        </button>
                        {availableSeasons.map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setCurrentSeason(s)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    currentSeason === s
                                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary)/0.3)]'
                                        : 'bg-[hsl(var(--accent))] text-muted-foreground hover:bg-[hsl(var(--accent)/0.8)] hover:text-foreground'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Min Games Filter - Instant 0 ms switching */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-t border-[hsl(var(--border))]">
                    <span className="text-sm font-medium text-muted">Min Games:</span>
                    <div className="flex flex-wrap gap-2">
                        {[1, 3, 5, 10, 15, 20, 25, 30].map(val => (
                            <button
                                key={val}
                                type="button"
                                onClick={() => setCurrentMinGames(val)}
                                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                                    currentMinGames === val
                                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary)/0.3)]'
                                        : 'bg-[hsl(var(--accent))] text-muted-foreground hover:bg-[hsl(var(--accent)/0.8)] hover:text-foreground'
                                }`}
                            >
                                {val}{val === 30 ? '+' : ''}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Core Leaderboards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Goals / Game (Efficiency) */}
                <Leaderboard
                    title="Efficiency"
                    icon={Target}
                    data={stats.efficiency}
                    precision={2}
                    suffix=" G/G"
                    description={`Average goals scored per game (min. ${currentMinGames} games).`}
                />

                {/* 2. Total Goals (Volume) */}
                <Leaderboard
                    title="Golden Boot"
                    icon={Trophy}
                    data={stats.totalGoals}
                    precision={0}
                    description="Total goals scored across all games."
                />

                {/* 3. Games Played (Reliability) */}
                <Leaderboard
                    title="Reliability"
                    icon={Shield}
                    data={stats.gamesPlayed}
                    precision={0}
                    description="Total number of games attended."
                />

                {/* 4. Lucky Charm (Win %) */}
                <Leaderboard
                    title="Lucky Charm"
                    icon={Crown}
                    data={stats.luckyCharm}
                    precision={1}
                    suffix="%"
                    description={`% of games won when this player is playing (min ${currentMinGames} games).`}
                />

                {/* 5. Clutch Factor (Goal Win %) */}
                <Leaderboard
                    title="Clutch Factor"
                    icon={Zap}
                    data={stats.clutchFactor}
                    precision={1}
                    suffix="%"
                    description={`% of goals scored in winning games (min ${currentMinGames} games).`}
                />

                {/* 6. Fighting Spirit (Goal Lose %) */}
                <Leaderboard
                    title="Fighting Spirit"
                    icon={Flame}
                    data={stats.fightingSpirit}
                    precision={1}
                    suffix="%"
                    description={`% of goals scored in losing games (min ${currentMinGames} games).`}
                />
            </div>

            {/* Power Rankings Section */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Zap className="text-yellow-500" /> Power Rankings <span className="text-sm font-normal text-muted">(Individual Impact)</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Offensive Rating */}
                    <Leaderboard
                        title="The Spearhead"
                        icon={Target}
                        data={stats.offensiveRating}
                        precision={2}
                        description={`Offensive Rating: Average goals scored by the team when this player is on the pitch (Higher is better, min ${currentMinGames} games).`}
                    />

                    {/* Defensive Rating */}
                    <Leaderboard
                        title="The Individual Wall"
                        icon={Shield}
                        data={stats.defensiveRating}
                        precision={2}
                        description={`Defensive Rating: Average goals conceded by the team when this player is on the pitch (Lower is better, min ${currentMinGames} games).`}
                    />

                    {/* Net Rating */}
                    <Leaderboard
                        title="The Difference Maker"
                        icon={Crown}
                        data={stats.netRating}
                        precision={2}
                        showSign={true}
                        description={`Net Rating: Average goal difference when this player is on the pitch (Higher is better, min ${currentMinGames} games).`}
                    />
                </div>
            </div>

            {/* Team Synergy Section */}
            <div className="mt-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Users className="text-[hsl(var(--primary))]" /> Team Synergy
                        <span className="text-sm font-normal text-muted">
                            ({currentSynergySize === 2 ? 'Duos' : currentSynergySize === 3 ? 'Trios' : currentSynergySize === 4 ? 'Quartets' : 'Quintets'})
                        </span>
                    </h2>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted uppercase tracking-wider">Group Size:</span>
                        <div className="flex gap-2">
                            {[
                                { value: 2, label: 'Duos' },
                                { value: 3, label: 'Trios' },
                                { value: 4, label: 'Quartets' },
                                { value: 5, label: '5s' }
                            ].map(item => (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => setCurrentSynergySize(item.value)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                                        currentSynergySize === item.value
                                            ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] shadow-sm'
                                            : 'bg-transparent text-muted-foreground border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]'
                                    }`}
                                >
                                    {item.label} (x{item.value})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* The Core */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Users size={24} /></div>
                            <h3 className="text-lg font-bold">The Core</h3>
                        </div>
                        <p className="text-lg text-muted mb-4">Groups with the most appearances together.</p>
                        <div className="space-y-3">
                            {synergy.theCore.map((trio, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-[hsl(var(--background)/0.5)] border border-[hsl(var(--border))]">
                                    <div className="text-sm font-medium">
                                        {trio.playerNames.join(', ')}
                                    </div>
                                    <div className="font-bold text-blue-500">{trio.value} Games</div>
                                </div>
                            ))}
                            {synergy.theCore.length === 0 && <p className="text-muted text-sm">Not enough data.</p>}
                        </div>
                    </div>

                    {/* Match Winners */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-lg bg-green-500/10 text-green-500"><Trophy size={24} /></div>
                            <h3 className="text-lg font-bold">Match Winners</h3>
                        </div>
                        <p className="text-lg text-muted mb-4">Highest Win % (min {currentMinGames} games).</p>
                        <div className="space-y-3">
                            {synergy.matchWinners.map((trio, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-[hsl(var(--background)/0.5)] border border-[hsl(var(--border))]">
                                    <div className="text-sm font-medium">
                                        {trio.playerNames.join(', ')}
                                    </div>
                                    <div className="font-bold text-green-500">{trio.value.toFixed(1)}%</div>
                                </div>
                            ))}
                            {synergy.matchWinners.length === 0 && <p className="text-muted text-sm">Not enough data.</p>}
                        </div>
                    </div>

                    {/* The Wall */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-lg bg-red-500/10 text-red-500"><Shield size={24} /></div>
                            <h3 className="text-lg font-bold">The Wall</h3>
                        </div>
                        <p className="text-lg text-muted mb-4">Lowest Avg Goals Conceded (min {currentMinGames} games).</p>
                        <div className="space-y-3">
                            {synergy.theWall.map((trio, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-[hsl(var(--background)/0.5)] border border-[hsl(var(--border))]">
                                    <div className="text-sm font-medium">
                                        {trio.playerNames.join(', ')}
                                    </div>
                                    <div className="font-bold text-red-500">{trio.value.toFixed(2)}</div>
                                </div>
                            ))}
                            {synergy.theWall.length === 0 && <p className="text-muted text-sm">Not enough data.</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Analytics Section */}
            <div className="mt-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Leaderboard
                        title="Money / Game"
                        icon={DollarSign}
                        data={stats.moneyPerGame}
                        precision={2}
                        prefix="$"
                        description={`Average cost and contribution per match appearance (min ${currentMinGames} games, Season 3+).`}
                    />
                </div>
            </div>
        </div>
    );
}
