import { getData, calculatePlayerStats } from '@/lib/storage';
import { createPlayer } from '@/app/actions';
import { UserPlus, Wallet } from 'lucide-react';
import Link from 'next/link';

export default async function PlayersPage() {
    const data = await getData();
    const players = data.players.map(p => {
        const stats = calculatePlayerStats(data, p.id);
        return { ...p, ...stats };
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Players</h1>
                    <p className="text-muted">Manage your squad and track payments.</p>
                </div>
            </header>

            {/* Add Player Form */}
            <div className="glass-card p-6 rounded-2xl">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <UserPlus size={20} className="text-[hsl(var(--primary))]" /> Add New Player
                </h2>
                <form action={createPlayer} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label htmlFor="name" className="block text-sm font-medium mb-1 text-muted">Player Name</label>
                        <input required name="name" id="name" type="text" placeholder="e.g. John Doe" className="input" />
                    </div>
                    <button type="submit" className="btn btn-primary">Add Player</button>
                </form>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {players.map(player => (
                    <Link href={`/players/${player.id}`} key={player.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between group hover:border-[hsl(var(--primary)/0.5)] transition-colors cursor-pointer">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center text-xl font-bold text-white">
                                    {player.name.charAt(0)}
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-bold ${player.owed > 0
                                    ? 'bg-[hsl(var(--destructive)/0.2)] text-[hsl(var(--destructive))]'
                                    : 'bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))]'
                                    }`}>
                                    {player.owed > 0 ? `Owes $${player.owed.toFixed(2)}` : 'Settled'}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-1">{player.name}</h3>
                            <div className="text-sm text-muted mb-6">
                                {player.gamesPlayed} Games Played
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">Total Billed</span>
                                <span>${player.totalCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">Total Paid</span>
                                <span className="text-[hsl(var(--primary))]">${player.totalPaid.toFixed(2)}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
