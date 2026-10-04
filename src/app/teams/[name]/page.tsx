import { getData } from '@/lib/storage';
import { getOpponentDetails, getDifficultyCategory, getOrdinal } from '@/lib/difficulty';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Minus, Trophy, Shield, Flame } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import OpponentNotes from '@/components/OpponentNotes';

export const dynamic = 'force-dynamic';

export default async function TeamPage({ params }: { params: Promise<{ name: string }> }) {
    const resolvedParams = await params;
    const teamName = decodeURIComponent(resolvedParams.name);
    const data = await getData();

    const gamesAgainst = data.games
        .filter(g => g.opponent.toLowerCase() === teamName.toLowerCase())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (gamesAgainst.length === 0) {
        notFound();
    }

    // Shared calculation for difficulty, rank, confidence, and record
    const oppStats = getOpponentDetails(data.games, teamName);

    // Fallback if not found for any reason
    const wins = oppStats ? oppStats.wins : 0;
    const draws = oppStats ? oppStats.draws : 0;
    const losses = oppStats ? oppStats.losses : 0;
    const goalsFor = oppStats ? oppStats.goalsScored : 0;
    const goalsAgainst = oppStats ? oppStats.goalsConceded : 0;
    const goalDiff = oppStats ? oppStats.goalDifference : 0;
    const difficultyScore = oppStats ? oppStats.displayDifficulty : 5.0;
    const rank = oppStats ? oppStats.rank : 1;
    const totalOpponents = oppStats ? oppStats.totalOpponents : 1;
    const confidenceLabel = oppStats ? oppStats.confidenceLabel : 'Low';
    const gamesPlayed = oppStats ? oppStats.gamesPlayed : gamesAgainst.length;

    const cat = getDifficultyCategory(difficultyScore);
    const scorePct = Math.min(100, Math.max(0, (difficultyScore / 10) * 100));

    // Dynamic rank text (e.g. "Hardest opponent" or "2nd hardest opponent")
    const rankSubtitle = rank === 1 
        ? 'Hardest opponent' 
        : `${getOrdinal(rank)} hardest opponent`;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header>
                <Link 
                    href="/teams" prefetch={true} 
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-[hsl(var(--primary))] mb-4 transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={16} /> Back to Opponents Ladder
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            vs {teamName}
                        </h1>
                        <p className="text-muted">Head-to-head difficulty &amp; match history.</p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs text-muted font-medium bg-[hsl(var(--background)/0.6)] px-3 py-1.5 rounded-xl border border-[hsl(var(--border))]">
                            {gamesPlayed} total {gamesPlayed === 1 ? 'match' : 'matches'} played
                        </span>
                    </div>
                </div>
            </header>

            {/* 7 Summary Metric Cards */}
            <div className="space-y-4">
                {/* Opponent Notes */}
                <OpponentNotes teamName={teamName} />

                {/* Row 1: Traditional Record & Scoring (Wins, Draws, Losses, Agg. Score) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="glass-card p-4 rounded-xl text-center border border-[hsl(var(--border))]">
                        <div className="text-3xl font-black text-emerald-400">{wins}</div>
                        <div className="text-xs text-muted font-bold uppercase tracking-wider mt-1">Wins</div>
                    </div>

                    <div className="glass-card p-4 rounded-xl text-center border border-[hsl(var(--border))]">
                        <div className="text-3xl font-black text-slate-300">{draws}</div>
                        <div className="text-xs text-muted font-bold uppercase tracking-wider mt-1">Draws</div>
                    </div>

                    <div className="glass-card p-4 rounded-xl text-center border border-[hsl(var(--border))]">
                        <div className="text-3xl font-black text-rose-400">{losses}</div>
                        <div className="text-xs text-muted font-bold uppercase tracking-wider mt-1">Losses</div>
                    </div>

                    <div className="glass-card p-4 rounded-xl text-center flex flex-col items-center justify-center border border-[hsl(var(--border))]">
                        <div className="text-2xl font-black flex items-center gap-1.5 tabular-nums">
                            <span className="text-emerald-400">{goalsFor}</span>
                            <span className="text-muted-foreground">-</span>
                            <span className="text-rose-400">{goalsAgainst}</span>
                        </div>
                        <div className="text-xs text-muted font-bold uppercase tracking-wider mt-1">
                            Agg. Score <span className="font-normal lowercase">({goalDiff > 0 ? `+${goalDiff}` : goalDiff} GD)</span>
                        </div>
                    </div>
                </div>

                {/* Row 2: Difficulty, Ladder Position & Confidence */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 5. H2H DIFFICULTY */}
                    <div className="glass-card p-5 rounded-xl border border-[hsl(var(--border))] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Flame size={14} className={cat.colorClass} />
                                H2H Difficulty
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${cat.bgClass} ${cat.colorClass} ${cat.borderClass}`}>
                                {cat.label}
                            </span>
                        </div>

                        <div className="flex items-baseline gap-1.5 my-1">
                            <span className="text-3xl font-black tracking-tight tabular-nums">
                                {difficultyScore.toFixed(1)}
                            </span>
                            <span className="text-sm text-muted font-medium">/ 10</span>
                        </div>

                        {/* Subtle Difficulty Gauge with 5.0 neutral midpoint */}
                        <div className="mt-2">
                            <div className="relative h-2 rounded-full bg-slate-800 border border-slate-700/60 overflow-hidden">
                                <div 
                                    className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10" 
                                    style={{ left: '50%' }}
                                    title="5.0 Even Baseline"
                                />
                                <div 
                                    className={`h-full rounded-full transition-all duration-300 ${
                                        difficultyScore > 6.0 
                                            ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                                            : difficultyScore >= 4.0 
                                                ? 'bg-gradient-to-r from-green-500 to-amber-500' 
                                                : 'bg-gradient-to-r from-emerald-500 to-green-500'
                                    }`}
                                    style={{ width: `${scorePct}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
                                <span>0 (Easy)</span>
                                <span className="font-semibold text-slate-300">5 (Even)</span>
                                <span>10 (Hard)</span>
                            </div>
                        </div>
                    </div>

                    {/* 6. LADDER POSITION */}
                    <div className="glass-card p-5 rounded-xl border border-[hsl(var(--border))] flex flex-col justify-between">
                        <div className="text-xs text-muted font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Trophy size={14} className="text-[hsl(var(--secondary))]" />
                            Ladder Position
                        </div>

                        <div className="my-1">
                            <div className="text-3xl font-black tracking-tight tabular-nums">
                                {getOrdinal(rank)} <span className="text-lg text-muted font-normal">/ {totalOpponents}</span>
                            </div>
                            <div className="text-xs text-muted font-medium mt-1">
                                &ldquo;{rankSubtitle}&rdquo;
                            </div>
                        </div>

                        <div className="text-[11px] text-muted mt-2 pt-2 border-t border-[hsl(var(--border))]">
                            Ranked by H2H Difficulty across all opponents
                        </div>
                    </div>

                    {/* 7. DIFFICULTY CONFIDENCE */}
                    <div className="glass-card p-5 rounded-xl border border-[hsl(var(--border))] flex flex-col justify-between">
                        <div className="text-xs text-muted font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Shield size={14} className="text-[hsl(var(--primary))]" />
                            Difficulty Confidence
                        </div>

                        <div className="my-1">
                            <div className="text-2xl font-black uppercase tracking-wide flex items-center gap-2">
                                <span className={`${
                                    confidenceLabel === 'Excellent' 
                                        ? 'text-emerald-400' 
                                        : confidenceLabel === 'Very High' 
                                            ? 'text-green-400' 
                                            : confidenceLabel === 'High' 
                                                ? 'text-lime-400' 
                                                : confidenceLabel === 'Medium' 
                                                    ? 'text-amber-400' 
                                                    : 'text-red-400'
                                }`}>
                                    {confidenceLabel}
                                </span>
                            </div>
                            <div className="text-xs text-muted uppercase font-bold tracking-wider mt-1">
                                {gamesPlayed} {gamesPlayed === 1 ? 'MATCH' : 'MATCHES'}
                            </div>
                        </div>

                        <div className="text-[11px] text-muted mt-2 pt-2 border-t border-[hsl(var(--border))]">
                            {gamesPlayed < 3 
                                ? 'Small sample: score pulled toward 5.0 neutral' 
                                : '3+ games: reliable established head-to-head metric'}
                        </div>
                    </div>
                </div>
            </div>

            {/* PRESERVED: Match History & Lineups Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar size={20} className="text-[hsl(var(--muted-foreground))]" /> Matches
                </h2>

                {gamesAgainst.map(game => (
                    <div key={game.id} className="glass-card p-6 rounded-2xl border border-[hsl(var(--border))]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="text-sm font-bold text-[hsl(var(--secondary))] uppercase tracking-wider mb-1">
                                    {new Date(game.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl font-bold bg-[hsl(var(--background)/0.5)] px-4 py-2 rounded-xl border border-[hsl(var(--border))]">
                                        {game.score}
                                    </span>
                                    {/* Result Badge */}
                                    {(() => {
                                        const parts = game.score.split(/[-:]/).map(p => parseInt(p.trim()));
                                        if (parts.length === 2 && !isNaN(parts[1])) {
                                            if (parts[0] > parts[1]) return <div className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-bold flex items-center gap-1"><TrendingUp size={14} /> Win</div>;
                                            if (parts[1] > parts[0]) return <div className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm font-bold flex items-center gap-1"><TrendingDown size={14} /> Loss</div>;
                                            return <div className="px-3 py-1 bg-gray-500/20 text-gray-500 rounded-full text-sm font-bold flex items-center gap-1"><Minus size={14} /> Draw</div>;
                                        }
                                    })()}
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-muted mb-3 uppercase tracking-wider">Squad &amp; Goals</h3>
                                <div className="flex flex-wrap gap-2">
                                    {game.players.map(perf => {
                                        const p = data.players.find(pl => pl.id === perf.playerId);
                                        if (!p) return null;
                                        return (
                                            <div key={perf.playerId} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${perf.goals > 0
                                                    ? 'bg-[hsl(var(--primary)/0.15)] border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))]'
                                                    : 'bg-[hsl(var(--background)/0.5)] border-[hsl(var(--border))] text-muted-foreground'
                                                }`}>
                                                <span className="text-sm font-medium">{p.name}</span>
                                                {perf.goals > 0 && (
                                                    <span className="text-xs font-bold bg-[hsl(var(--primary))] text-white px-1.5 rounded-md">
                                                        {perf.goals}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
