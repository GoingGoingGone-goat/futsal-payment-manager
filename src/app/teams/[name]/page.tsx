
import { getData } from '@/lib/storage';
import { ArrowLeft, Calendar, Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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

    // Calculate stats
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    gamesAgainst.forEach(game => {
        // Basic score parsing "5-3" (Us-Them)
        // Assumption: Score format is Us-Them or we can try to guess?
        // User input "Score" is a text field. "5-3". 
        // Let's try to split by '-' or ':'
        const parts = game.score.split(/[-:]/).map(p => parseInt(p.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            const us = parts[0];
            const them = parts[1];
            goalsFor += us;
            goalsAgainst += them;
            if (us > them) wins++;
            else if (them > us) losses++;
            else draws++;
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <Link href="/games" className="inline-flex items-center gap-2 text-muted-foreground hover:text-[hsl(var(--primary))] mb-4 transition-colors">
                    <ArrowLeft size={16} /> Back to Games
                </Link>
                <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">vs {teamName}</h1>
                <p className="text-muted">Head-to-head history.</p>
            </header>

            {/* Head to Head Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-xl text-center">
                    <div className="text-3xl font-bold text-[hsl(var(--primary))]">{wins}</div>
                    <div className="text-xs text-muted font-bold uppercase tracking-wider">Wins</div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                    <div className="text-3xl font-bold text-gray-400">{draws}</div>
                    <div className="text-xs text-muted font-bold uppercase tracking-wider">Draws</div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                    <div className="text-3xl font-bold text-[hsl(var(--destructive))]">{losses}</div>
                    <div className="text-xs text-muted font-bold uppercase tracking-wider">Losses</div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center flex flex-col items-center justify-center">
                    <div className="text-xl font-bold flex items-center gap-1">
                        <span className="text-[hsl(var(--primary))]">{goalsFor}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className="text-[hsl(var(--destructive))]">{goalsAgainst}</span>
                    </div>
                    <div className="text-xs text-muted font-bold uppercase tracking-wider">Agg. Score</div>
                </div>
            </div>

            {/* Match History */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar size={20} className="text-[hsl(var(--muted-foreground))]" /> Matches
                </h2>

                {gamesAgainst.map(game => (
                    <div key={game.id} className="glass-card p-6 rounded-2xl">
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
                                <h3 className="text-sm font-medium text-muted mb-3 uppercase tracking-wider">Squad & Goals</h3>
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
