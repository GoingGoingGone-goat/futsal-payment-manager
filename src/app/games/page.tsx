import { getData } from '@/lib/storage';
import { createGame, deleteGameAction } from '@/app/actions';
import { Calendar, PlusCircle, Trash2, User, Pencil } from 'lucide-react';
import Link from 'next/link';

import { FlashMessage } from '@/components/FlashMessage';

export const dynamic = 'force-dynamic';

export default async function GamesPage() {
    const data = await getData();
    const sortedGames = [...data.games].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <FlashMessage />
            <header>
                <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Games</h1>
                <p className="text-muted">Record match results and billing.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Game Form */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-6 rounded-2xl sticky top-8">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <PlusCircle size={20} className="text-[hsl(var(--secondary))]" /> Record New Game
                        </h2>
                        <form action={createGame} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-muted">Season</label>
                                    <select name="season" defaultValue="Season 4" className="input">
                                        <option value="Season 4">Season 4</option>
                                        <option value="Season 3">Season 3</option>
                                        <option value="Season 2">Season 2</option>
                                        <option value="Season 1">Season 1</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-muted">Opponent</label>
                                    <input required name="opponent" type="text" placeholder="vs Team Name" className="input" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-muted">Date</label>
                                    <input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="input" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-muted">Score</label>
                                    <input required name="score" type="text" placeholder="e.g. 5-3" className="input" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-muted">Total Cost ($)</label>
                                <input required name="totalCost" type="number" step="0.01" defaultValue="99.00" className="input" />
                                <p className="text-xs text-muted mt-1">Split evenly amongst players.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-muted">Squad & Goals</label>
                                <div className="space-y-2 max-h-80 overflow-y-auto p-2 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--background)/0.5)]">
                                    {data.players.length === 0 ? (
                                        <p className="text-xs text-muted text-center py-2">No players found. Add players first.</p>
                                    ) : (
                                        data.players.map(player => (
                                            <div key={player.id} className="flex items-center justify-between gap-2 p-2 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors group">
                                                <label className="flex items-center gap-3 cursor-pointer flex-1">
                                                    <input type="checkbox" name="players" value={player.id} className="w-4 h-4 rounded border-gray-300 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]" />
                                                    <span className="text-sm font-medium">{player.name}</span>
                                                </label>
                                                <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[10px] uppercase text-muted">Goals:</span>
                                                    <input
                                                        type="number"
                                                        name={`goals-${player.id}`}
                                                        min="0"
                                                        placeholder="0"
                                                        className="w-12 p-1 text-xs rounded bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-center focus:border-[hsl(var(--primary))] outline-none"
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary w-full justify-center">Record Game</button>
                        </form>
                    </div>
                </div>

                {/* Games List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Calendar size={20} className="text-[hsl(var(--muted-foreground))]" /> Match History
                    </h2>

                    {sortedGames.length === 0 ? (
                        <div className="glass-card p-12 rounded-2xl text-center text-muted">
                            No games recorded yet.
                        </div>
                    ) : (
                        sortedGames.map(game => (
                            <div key={game.id} className="glass-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-sm font-bold text-[hsl(var(--secondary))] uppercase tracking-wider">
                                            {new Date(game.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className="bg-[hsl(var(--accent))] text-xs px-2 py-0.5 rounded text-muted-foreground">
                                            ${game.costPerPlayer.toFixed(2)}/player
                                        </span>
                                        <span className="bg-[hsl(var(--secondary)/0.2)] text-[hsl(var(--secondary))] text-xs px-2 py-0.5 rounded font-medium">
                                            {game.season || 'Season 4'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold flex items-center gap-3">
                                        <span className="text-muted-foreground">vs</span>
                                        <Link
                                            href={`/teams/${encodeURIComponent(game.opponent)}`}
                                            className="hover:text-[hsl(var(--primary))] hover:underline underline-offset-4 decoration-2 transition-all"
                                        >
                                            {game.opponent}
                                        </Link>
                                        <span className="bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] px-3 py-1 rounded-lg text-lg">
                                            {game.score}
                                        </span>
                                    </h3>
                                </div>

                                <div className="flex -space-x-2 overflow-hidden">
                                    {game.players.slice(0, 5).map(perf => {
                                        const p = data.players.find(pl => pl.id === perf.playerId);
                                        return p ? (
                                            <div key={perf.playerId} title={`${p.name} (${perf.goals} goals)`} className="relative h-8 w-8 rounded-full ring-2 ring-[hsl(var(--card))] bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white group cursor-default">
                                                {p.name.charAt(0)}
                                                {perf.goals > 0 && (
                                                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-[hsl(var(--primary))] rounded-full border border-[hsl(var(--card))]"></span>
                                                )}
                                            </div>
                                        ) : null;
                                    })}
                                    {game.players.length > 5 && (
                                        <div className="h-8 w-8 rounded-full ring-2 ring-[hsl(var(--card))] bg-[hsl(var(--accent))] flex items-center justify-center text-xs font-medium">
                                            +{game.players.length - 5}
                                        </div>
                                    )}
                                </div>

                                <Link href={`/games/${game.id}/edit`} className="p-2 text-muted-foreground hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)] rounded-full transition-colors" title="Edit Game">
                                    <Pencil size={18} />
                                </Link>
                                <form action={deleteGameAction.bind(null, game.id)} className="ml-2 self-center">
                                    <button type="submit" className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors" title="Delete Game">
                                        <Trash2 size={18} />
                                    </button>
                                </form>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div >
    );
}
