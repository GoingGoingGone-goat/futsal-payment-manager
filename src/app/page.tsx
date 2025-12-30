import { getData, getPlayerStats } from '@/lib/storage';
import { DollarSign, Trophy, Users, TrendingUp } from 'lucide-react';
import CopyDebtButton from '@/components/CopyDebtButton';

async function getDashboardData() {
    const data = await getData();
    const playerStats = await Promise.all(data.players.map(p => getPlayerStats(p.id)));

    const totalOwed = playerStats.reduce((sum, s) => sum + s.owed, 0);
    const totalGames = data.games.length;
    const activePlayers = data.players.length;

    // Players who owe money, sorted by amount desc
    const debtors = data.players
        .map((p, i) => ({ ...p, ...playerStats[i] }))
        .filter(p => p.owed > 0)
        .sort((a, b) => b.owed - a.owed);

    const recentGames = [...data.games].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return { totalOwed, totalGames, activePlayers, debtors, recentGames };
}

export default async function Home() {
    const { totalOwed, totalGames, activePlayers, debtors, recentGames } = await getDashboardData();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Dashboard</h1>
                <p className="text-muted">Overview of your team's finances and performance.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={80} />
                    </div>
                    <h3 className="text-sm font-medium text-muted">Total Outstanding</h3>
                    <p className="text-4xl font-bold mt-2 text-[hsl(var(--primary))]">${totalOwed.toFixed(2)}</p>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy size={80} />
                    </div>
                    <h3 className="text-sm font-medium text-muted">Games Played</h3>
                    <p className="text-4xl font-bold mt-2">{totalGames}</p>
                </div>

                <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={80} />
                    </div>
                    <h3 className="text-sm font-medium text-muted">Active Players</h3>
                    <p className="text-4xl font-bold mt-2">{activePlayers}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Outstanding Debts */}
                <section className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <TrendingUp className="text-[hsl(var(--destructive))]" />
                            Outstanding Debts
                        </h2>
                        <CopyDebtButton debtors={debtors} />
                    </div>

                    <div className="space-y-4">
                        {debtors.length === 0 ? (
                            <p className="text-muted text-center py-8">No specific debts found. Good job!</p>
                        ) : (
                            debtors.map(player => (
                                <div key={player.id} className="flex items-center justify-between p-3 rounded-xl bg-[hsl(var(--background)/0.5)] border border-[hsl(var(--border))]">
                                    <span className="font-medium">{player.name}</span>
                                    <span className="font-bold text-[hsl(var(--destructive))]">
                                        -${player.owed.toFixed(2)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Recent Games */}
                <section className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Trophy className="text-[hsl(var(--secondary))]" />
                            Recent Games
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {recentGames.length === 0 ? (
                            <p className="text-muted text-center py-8">No games recorded yet.</p>
                        ) : (
                            recentGames.map(game => (
                                <div key={game.id} className="flex items-center justify-between p-3 rounded-xl bg-[hsl(var(--background)/0.5)] border border-[hsl(var(--border))]">
                                    <div>
                                        <div className="font-medium">vs {game.opponent}</div>
                                        <div className="text-xs text-muted">{new Date(game.date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="font-bold bg-[hsl(var(--accent))] px-3 py-1 rounded-lg">
                                        {game.score}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div >
        </div >
    );
}
