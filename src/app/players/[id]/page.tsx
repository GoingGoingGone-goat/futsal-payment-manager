export const dynamic = 'force-dynamic';

import { getData, getPlayerProfileData } from '@/lib/storage';
import { deletePlayerAction } from '@/app/actions';
import {
    ArrowLeft,
    History,
    Trophy,
    Trash2,
    Wallet,
    BadgeDollarSign,
    Activity,
    TrendingUp,
    TrendingDown,
    Minus,
    Zap,
    Users,
    ChevronRight,
    Target,
    Shield
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EditablePlayerName } from '@/components/EditablePlayerName';

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const playerId = resolvedParams.id;
    const data = await getData();

    const profile = getPlayerProfileData(data, playerId);
    if (!profile) {
        notFound();
    }

    // Sort history by date descending
    const paymentHistory = [...profile.history.payments].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const gameHistory = [...profile.history.games].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const winDiff = profile.winPctDiff;
    const winDiffSign = winDiff > 0 ? '+' : '';
    const winDiffFormatted = `${winDiffSign}${winDiff.toFixed(1)} percentage points`;

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <header>
                <div className="flex justify-between items-center mb-4">
                    <Link
                        href="/players"
                        prefetch={true}
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors font-medium text-sm"
                    >
                        <ArrowLeft size={16} /> Back to Players
                    </Link>
                    <form action={deletePlayerAction.bind(null, playerId)}>
                        <button
                            type="submit"
                            className="text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={16} /> Delete Player
                        </button>
                    </form>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-[hsl(var(--primary)/0.2)]">
                        {profile.name.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <EditablePlayerName id={profile.id} initialName={profile.name} />
                        </div>
                        <p className="text-xs text-muted uppercase tracking-wider mt-0.5">Player Profile</p>
                        <div className={`inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-bold mt-2 ${
                            profile.owed > 0
                                ? 'bg-[hsl(var(--destructive)/0.2)] text-[hsl(var(--destructive))]'
                                : 'bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))]'
                        }`}>
                            {profile.owed > 0 ? `Owes $${profile.owed.toFixed(2)}` : 'All Settled'}
                        </div>
                    </div>
                </div>
            </header>

            {/* 1. PERFORMANCE SECTION */}
            <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-foreground uppercase tracking-wider">
                        <Activity size={20} className="text-[hsl(var(--primary))]" /> Performance
                    </h2>
                    <span className="text-xs text-muted">All-time club match record</span>
                </div>

                {/* 4-Box Grid: Games, Wins, Draws, Losses */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted">Games</span>
                        <div className="text-3xl sm:text-4xl font-black mt-2">{profile.gamesPlayed}</div>
                        <span className="text-[11px] text-muted mt-1">Appearances</span>
                    </div>

                    <div className="glass-card p-5 rounded-2xl flex flex-col justify-between border-green-500/20">
                        <span className="text-xs font-semibold uppercase tracking-wider text-green-500 flex items-center gap-1">
                            <TrendingUp size={14} /> Wins
                        </span>
                        <div className="text-3xl sm:text-4xl font-black text-green-500 mt-2">{profile.wins}</div>
                        <span className="text-[11px] text-muted mt-1">
                            {profile.gamesPlayed > 0 ? `${((profile.wins / profile.gamesPlayed) * 100).toFixed(0)}% of matches` : '0%'}
                        </span>
                    </div>

                    <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Minus size={14} /> Draws
                        </span>
                        <div className="text-3xl sm:text-4xl font-black text-slate-300 mt-2">{profile.draws}</div>
                        <span className="text-[11px] text-muted mt-1">
                            {profile.gamesPlayed > 0 ? `${((profile.draws / profile.gamesPlayed) * 100).toFixed(0)}% of matches` : '0%'}
                        </span>
                    </div>

                    <div className="glass-card p-5 rounded-2xl flex flex-col justify-between border-red-500/20">
                        <span className="text-xs font-semibold uppercase tracking-wider text-red-500 flex items-center gap-1">
                            <TrendingDown size={14} /> Losses
                        </span>
                        <div className="text-3xl sm:text-4xl font-black text-red-500 mt-2">{profile.losses}</div>
                        <span className="text-[11px] text-muted mt-1">
                            {profile.gamesPlayed > 0 ? `${((profile.losses / profile.gamesPlayed) * 100).toFixed(0)}% of matches` : '0%'}
                        </span>
                    </div>
                </div>

                {/* Win % Comparison & Goals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Win % Card with Club Win % Comparison */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted">Win Percentage</span>
                                <span className="text-xs font-medium text-muted">vs Club Overall</span>
                            </div>

                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl sm:text-5xl font-black text-[hsl(var(--primary))]">
                                    {profile.playerWinPct.toFixed(1)}%
                                </span>
                                <span className="text-sm font-medium text-muted">Player Win %</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[hsl(var(--border))] space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted">Club Win % (All matches)</span>
                                <span className="font-bold">{profile.clubWinPct.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted">Difference</span>
                                <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                                    winDiff > 0
                                        ? 'bg-green-500/20 text-green-400'
                                        : winDiff < 0
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-slate-500/20 text-slate-300'
                                }`}>
                                    {winDiffFormatted}
                                </span>
                            </div>
                            <p className="text-[11px] text-muted mt-2">
                                Descriptive comparison of club win rate in matches featuring {profile.name} versus overall history.
                            </p>
                        </div>
                    </div>

                    {/* Goals Card */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--secondary))] flex items-center gap-1.5">
                                    <Trophy size={14} /> Goals
                                </span>
                                <span className="text-xs font-medium text-muted">Historical Scored</span>
                            </div>

                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl sm:text-5xl font-black text-[hsl(var(--secondary))]">
                                    {profile.totalGoals}
                                </span>
                                <span className="text-sm font-medium text-muted">Total Goals</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[hsl(var(--border))] space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted">Goals per Game</span>
                                <span className="font-bold text-[hsl(var(--secondary))]">
                                    {profile.gamesPlayed > 0 ? (profile.totalGoals / profile.gamesPlayed).toFixed(2) : '0.00'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted">Games with at least 1 goal</span>
                                <span className="font-bold">
                                    {profile.history.games.filter(g => (g.players.find(p => p.playerId === profile.id)?.goals || 0) > 0).length}
                                </span>
                            </div>
                            <p className="text-[11px] text-muted mt-2">
                                Calculated directly from match scorecards and scorer records.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. FINANCIALS SECTION */}
            <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-foreground uppercase tracking-wider">
                        <Wallet size={20} className="text-[hsl(var(--primary))]" /> Financials
                    </h2>
                    <span className="text-xs text-muted">Payments, debts &amp; contributions</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Money Paid */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted">Money Paid</span>
                        <div className="text-3xl font-black text-[hsl(var(--primary))] my-2">
                            ${profile.totalPaid.toFixed(2)}
                        </div>
                        <span className="text-[11px] text-muted">Total incoming funds recorded</span>
                    </div>

                    {/* Money Owed */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted">Money Owed</span>
                        <div className={`text-3xl font-black my-2 ${profile.owed > 0 ? 'text-[hsl(var(--destructive))]' : 'text-foreground'}`}>
                            ${profile.owed.toFixed(2)}
                        </div>
                        <span className="text-[11px] text-muted">
                            {profile.owed > 0 ? 'Current outstanding balance' : 'Zero balance — settled'}
                        </span>
                    </div>

                    {/* Average Money per Game */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted">Money / Game</span>
                        <div className="text-3xl font-black my-2">
                            ${profile.avgMoneyPerGame.toFixed(2)}
                        </div>
                        <span className="text-[11px] text-muted">
                            (Paid + Owed) / Games Played
                        </span>
                    </div>
                </div>
            </section>

            {/* 3. RATINGS SECTION */}
            <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-foreground uppercase tracking-wider">
                        <Zap size={20} className="text-yellow-500" /> Ratings
                    </h2>
                    <span className="text-xs text-muted">Existing Power Rankings formula</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Offensive Rating */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border-yellow-500/20">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-1.5">
                                <Target size={14} /> Offensive Rating
                            </span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black my-2 text-foreground">
                            {profile.gamesPlayed > 0 ? `+${profile.offensiveRating.toFixed(1)}` : '0.0'}
                        </div>
                        <span className="text-[11px] text-muted">
                            Avg team goals scored per game on pitch
                        </span>
                    </div>

                    {/* Defensive Rating */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border-blue-500/20">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                                <Shield size={14} /> Defensive Rating
                            </span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black my-2 text-foreground">
                            {profile.gamesPlayed > 0 ? `-${profile.defensiveRating.toFixed(1)}` : '0.0'}
                        </div>
                        <span className="text-[11px] text-muted">
                            Avg team goals conceded per game on pitch
                        </span>
                    </div>

                    {/* Net Rating */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border-[hsl(var(--primary)/0.2)]">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))] flex items-center gap-1.5">
                                <Activity size={14} /> Net Rating
                            </span>
                        </div>
                        <div className={`text-3xl sm:text-4xl font-black my-2 ${
                            profile.netRating > 0
                                ? 'text-green-500'
                                : profile.netRating < 0
                                ? 'text-red-500'
                                : 'text-foreground'
                        }`}>
                            {profile.gamesPlayed > 0 ? `${profile.netRating >= 0 ? '+' : ''}${profile.netRating.toFixed(1)}` : '0.0'}
                        </div>
                        <span className="text-[11px] text-muted">
                            Avg goal differential per game on pitch
                        </span>
                    </div>
                </div>
            </section>

            {/* 4. MOST PLAYED WITH SECTION */}
            <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-foreground uppercase tracking-wider">
                        <Users size={20} className="text-[hsl(var(--primary))]" /> Most Played With
                    </h2>
                    <span className="text-xs text-muted">Top 5 teammates in match lineups</span>
                </div>

                {profile.mostPlayedWith.length === 0 ? (
                    <div className="glass-card p-8 rounded-2xl text-center text-muted text-sm">
                        No shared match lineups recorded yet for {profile.name}.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {profile.mostPlayedWith.map((tm, idx) => (
                            <Link
                                key={tm.id}
                                href={`/players/${tm.id}`}
                                prefetch={true}
                                className="glass-card p-4 rounded-xl flex items-center justify-between border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--accent)/0.3)] transition-all group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-[hsl(var(--accent))] text-xs font-bold text-muted-foreground group-hover:bg-[hsl(var(--primary)/0.2)] group-hover:text-[hsl(var(--primary))] transition-colors">
                                        {idx + 1}
                                    </span>
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center text-sm font-bold text-white shadow-sm">
                                        {tm.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-base group-hover:text-[hsl(var(--primary))] transition-colors">
                                            {tm.name}
                                        </div>
                                        <div className="text-xs text-muted">
                                            {tm.sharedGames} {tm.sharedGames === 1 ? 'shared game' : 'shared games'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-[hsl(var(--primary))] transition-colors">
                                    <span className="font-semibold text-xs uppercase tracking-wider hidden sm:inline">View Profile</span>
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* 5. SEASON BREAKDOWN */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider border-b border-[hsl(var(--border))] pb-2">
                    Season Breakdown
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profile.seasons && Object.entries(profile.seasons)
                        .sort((a, b) => b[0].localeCompare(a[0]))
                        .map(([seasonName, s]) => (
                            <div key={seasonName} className="glass-card p-6 rounded-2xl relative overflow-hidden">
                                <h3 className="text-lg font-bold mb-4 border-b border-[hsl(var(--border))] pb-2">{seasonName}</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted">Games</span>
                                        <span className="font-bold">{s.gamesPlayed}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Goals</span>
                                        <span className="font-bold text-[hsl(var(--secondary))]">{s.goalsScored}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Paid</span>
                                        <span className="font-bold text-[hsl(var(--primary))]">${s.totalPaid.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Owed</span>
                                        <span className={`font-bold ${s.owed > 0 ? 'text-[hsl(var(--destructive))]' : 'text-foreground'}`}>
                                            ${Math.max(0, s.owed).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </section>

            {/* 6. HISTORY SECTION: Payments, Fees, Matches */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment History */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Wallet size={20} className="text-[hsl(var(--primary))]" /> Payment History
                    </h2>
                    {paymentHistory.length === 0 ? (
                        <div className="glass-card p-8 rounded-xl text-center text-muted text-sm">
                            No payments recorded.
                        </div>
                    ) : (
                        <div className="glass-card rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[hsl(var(--accent))] text-muted-foreground text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 font-medium">Date</th>
                                        <th className="p-4 font-medium text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[hsl(var(--border))]">
                                    {paymentHistory.map(p => (
                                        <tr key={p.id} className="hover:bg-[hsl(var(--accent)/0.5)]">
                                            <td className="p-4 text-sm">{new Date(p.date).toLocaleDateString()}</td>
                                            <td className="p-4 text-sm font-bold text-right text-[hsl(var(--primary))]">+${p.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Fees & Charges */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <BadgeDollarSign size={20} className="text-[hsl(var(--secondary))]" /> Fees &amp; Charges
                    </h2>
                    {profile.history.fees.length === 0 ? (
                        <div className="glass-card p-8 rounded-xl text-center text-muted text-sm">
                            No extra fees recorded.
                        </div>
                    ) : (
                        <div className="glass-card rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[hsl(var(--accent))] text-muted-foreground text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 font-medium">Date</th>
                                        <th className="p-4 font-medium">Description</th>
                                        <th className="p-4 font-medium text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[hsl(var(--border))]">
                                    {profile.history.fees.map(f => (
                                        <tr key={f.id} className="hover:bg-[hsl(var(--accent)/0.5)]">
                                            <td className="p-4 text-sm">{new Date(f.date).toLocaleDateString()}</td>
                                            <td className="p-4 text-sm">{f.description}</td>
                                            <td className="p-4 text-sm font-bold text-right text-[hsl(var(--destructive))]">-${f.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Match History */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <History size={20} className="text-[hsl(var(--muted-foreground))]" /> Recent Matches
                    </h2>
                    {gameHistory.length === 0 ? (
                        <div className="glass-card p-8 rounded-xl text-center text-muted text-sm">
                            No games played.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {gameHistory.map(game => {
                                const performance = game.players.find(p => p.playerId === playerId);
                                const goals = performance?.goals || 0;

                                return (
                                    <div key={game.id} className="glass-card p-4 rounded-xl flex items-center justify-between gap-4">
                                        <div>
                                            <div className="text-xs text-muted mb-1">{new Date(game.date).toLocaleDateString()}</div>
                                            <div className="font-bold text-sm">
                                                <Link
                                                    href={`/teams/${encodeURIComponent(game.opponent)}`}
                                                    prefetch={true}
                                                    className="hover:text-[hsl(var(--primary))] hover:underline underline-offset-4 transition-all"
                                                >
                                                    vs {game.opponent}
                                                </Link>
                                            </div>
                                            <div className="text-xs text-muted">Cost: ${game.costPerPlayer.toFixed(2)}</div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {goals > 0 && (
                                                <div className="flex items-center gap-1 bg-[hsl(var(--secondary)/0.2)] text-[hsl(var(--secondary))] px-2.5 py-1 rounded-lg text-xs font-bold">
                                                    <Trophy size={12} /> {goals} {goals === 1 ? 'Goal' : 'Goals'}
                                                </div>
                                            )}
                                            <div className="font-bold bg-[hsl(var(--accent))] px-3 py-1 rounded-lg text-sm">
                                                {game.score}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
