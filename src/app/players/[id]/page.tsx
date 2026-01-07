
import { getData, getPlayerStats } from '@/lib/storage';
import { deletePlayerAction } from '@/app/actions';
import { ArrowLeft, History, Trophy, Trash2, Wallet, BadgeDollarSign } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const playerId = resolvedParams.id;
    const data = await getData();

    const player = data.players.find(p => p.id === playerId);
    if (!player) {
        notFound();
    }

    const stats = await getPlayerStats(playerId);

    // Sort history by date desc
    const paymentHistory = [...stats.history.payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const gameHistory = [...stats.history.games].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <div className="flex justify-between items-center mb-4">
                    <Link href="/players" className="inline-flex items-center gap-2 text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors">
                        <ArrowLeft size={16} /> Back to Players
                    </Link>
                    <form action={deletePlayerAction.bind(null, playerId)}>
                        <button type="submit" className="text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                            <Trash2 size={16} /> Delete Player
                        </button>
                    </form>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center text-3xl font-bold text-white">
                        {player.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 leading-tight">{player.name}</h1>
                        <div className={`inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-sm font-bold mt-2 ${stats.owed > 0 ? 'bg-[hsl(var(--destructive)/0.2)] text-[hsl(var(--destructive))]' : 'bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))]'
                            }`}>
                            {stats.owed > 0 ? `Owes $${stats.owed.toFixed(2)}` : 'All Settled'}
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-xl">
                    <h3 className="text-sm font-medium text-muted mb-1">Total Owed</h3>
                    <p className={`text-2xl font-bold ${stats.owed > 0 ? 'text-[hsl(var(--destructive))]' : 'text-foreground'}`}>
                        ${stats.owed.toFixed(2)}
                    </p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                    <h3 className="text-sm font-medium text-muted mb-1">Total Paid</h3>
                    <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                        ${stats.totalPaid.toFixed(2)}
                    </p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                    <h3 className="text-sm font-medium text-muted mb-1">Games Played</h3>
                    <p className="text-2xl font-bold">{stats.gamesPlayed}</p>
                </div>
                <div className="glass-card p-4 rounded-xl">
                    <h3 className="text-sm font-medium text-muted mb-1">Goals Scored</h3>
                    <p className="text-2xl font-bold text-[hsl(var(--secondary))]">{stats.goalsScored}</p>
                </div>
            </div>

            {/* Season Breakdown */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-muted-foreground">Season Breakdown</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.seasons && Object.entries(stats.seasons)
                        .sort((a, b) => b[0].localeCompare(a[0])) // Sort Season 3, Season 2...
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
                                </div>
                            </div>
                        ))}
                </div>
            </div>

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

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <BadgeDollarSign size={20} className="text-[hsl(var(--secondary))]" /> Fees & Charges
                    </h2>
                    {stats.history.fees.length === 0 ? (
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
                                    {stats.history.fees.map(f => (
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

                {/* Game History */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <History size={20} className="text-[hsl(var(--muted-foreground))]" /> Recent Games
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
                                            <div className="font-bold text-sm">vs {game.opponent}</div>
                                            <div className="text-xs text-muted">Cost: ${game.costPerPlayer.toFixed(2)}</div>
                                        </div>

                                        {goals > 0 && (
                                            <div className="flex items-center gap-1 bg-[hsl(var(--secondary)/0.2)] text-[hsl(var(--secondary))] px-2 py-1 rounded text-xs font-bold">
                                                <Trophy size={12} /> {goals} Goals
                                            </div>
                                        )}
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
