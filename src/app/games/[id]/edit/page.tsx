
import { getData } from '@/lib/storage';
import { editGame } from '@/app/actions';
import { ArrowLeft, Save, Trash2, Calendar, Trophy, Users } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getData();
    const game = data.games.find(g => g.id === id);

    if (!game) {
        notFound();
    }

    const [myScore, theirScore] = game.score.split('-').map(s => s.trim());

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
            <header className="flex items-center gap-4">
                <Link href="/games" className="p-2 rounded-full hover:bg-[hsl(var(--accent))] transition-colors text-muted-foreground">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Edit Game</h1>
                    <p className="text-muted">Update match details.</p>
                </div>
            </header>

            <div className="glass-card p-8 rounded-2xl">
                <form action={editGame} className="space-y-6">
                    <input type="hidden" name="id" value={game.id} />

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted flex items-center gap-2">
                                <Trophy size={16} /> Season
                            </label>
                            <select name="season" defaultValue={game.season} className="input w-full">
                                <option value="Season 6">Season 6</option>
                                <option value="Season 5">Season 5</option>
                                <option value="Season 4">Season 4</option>
                                <option value="Season 3">Season 3</option>
                                <option value="Season 2">Season 2</option>
                                <option value="Season 1">Season 1</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted flex items-center gap-2">
                                <Calendar size={16} /> Date
                            </label>
                            <input
                                required
                                name="date"
                                type="date"
                                defaultValue={game.date}
                                className="input w-full"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted flex items-center gap-2">
                            <Users size={16} /> Opponent
                        </label>
                        <input
                            required
                            name="opponent"
                            type="text"
                            defaultValue={game.opponent}
                            className="input w-full font-bold text-lg"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted">Score (Us - Them)</label>
                        <div className="flex items-center gap-4">
                            <input
                                required
                                name="scoreMy"
                                type="number"
                                min="0"
                                defaultValue={myScore}
                                className="input w-24 text-center text-2xl font-bold text-[hsl(var(--primary))]"
                            />
                            <span className="text-2xl font-bold text-muted">-</span>
                            <input
                                required
                                name="scoreTheir"
                                type="number"
                                min="0"
                                defaultValue={theirScore}
                                className="input w-24 text-center text-2xl font-bold text-[hsl(var(--destructive))]"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-[hsl(var(--border))] flex justify-end gap-3">
                        <Link href="/games" className="btn bg-slate-700 hover:bg-slate-600 text-white">
                            Cancel
                        </Link>
                        <button type="submit" className="btn btn-primary flex items-center gap-2">
                            <Save size={18} /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
