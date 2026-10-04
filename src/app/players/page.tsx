import { getData, calculatePlayerStats } from '@/lib/storage';
import { createPlayer } from '@/app/actions';
import { UserPlus, Wallet, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { FlashMessage } from '@/components/FlashMessage';
import { SubmitButton } from '@/components/SubmitButton';

export const dynamic = 'force-dynamic';

export default async function PlayersPage() {
    const data = await getData();
    const players = data.players.map(p => {
        const stats = calculatePlayerStats(data, p.id);
        return { ...p, ...stats };
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <FlashMessage />
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
                    <SubmitButton pendingText="Adding..." className="btn btn-primary">Add Player</SubmitButton>
                </form>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {players.map(player => (
                    <Link
                        href={`/players/${player.id}`}
                        prefetch={true}
                        key={player.id}
                        className="glass-card p-6 rounded-2xl flex flex-col justify-between group hover:border-[hsl(var(--primary)/0.6)] hover:bg-[hsl(var(--accent)/0.25)] transition-all cursor-pointer"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] flex items-center justify-center text-xl font-bold text-white shadow-md">
                                    {player.name.charAt(0)}
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${player.owed > 0
                                    ? 'bg-[hsl(var(--destructive)/0.2)] text-[hsl(var(--destructive))]'
                                    : 'bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))]'
                                    }`}>
                                    {player.owed > 0 ? `Owes $${player.owed.toFixed(2)}` : 'Settled'}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-1 group-hover:text-[hsl(var(--primary))] transition-colors">{player.name}</h3>
                            <div className="text-xs text-muted mb-6">
                                {player.gamesPlayed} {player.gamesPlayed === 1 ? 'Game' : 'Games'} • {player.goalsScored || 0} {player.goalsScored === 1 ? 'Goal' : 'Goals'}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">Total Billed</span>
                                <span>${player.totalCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">Total Paid</span>
                                <span className="text-[hsl(var(--primary))] font-bold">${player.totalPaid.toFixed(2)}</span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 mt-4 border-t border-[hsl(var(--border))] group-hover:text-[hsl(var(--primary))] transition-colors">
                                <span className="font-semibold uppercase tracking-wider">View Profile</span>
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
