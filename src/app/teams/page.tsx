
import { getAllTeamStats } from '@/lib/storage';
import { Shield, Trophy, Swords, Calendar } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
    const teams = await getAllTeamStats();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Opponents</h1>
                <p className="text-muted">Scouting reports and head-to-head records.</p>
            </header>

            {teams.length === 0 ? (
                <div className="glass-card p-12 rounded-2xl text-center text-muted">
                    No games recorded yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map(team => (
                        <Link
                            key={team.name}
                            href={`/teams/${encodeURIComponent(team.name)}`}
                            className="glass-card p-6 rounded-2xl hover:bg-[hsl(var(--accent))] transition-all group block relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Shield size={100} />
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    {team.name}
                                </h3>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-[hsl(var(--background)/0.5)] p-3 rounded-xl border border-[hsl(var(--border))]">
                                        <div className="text-xs text-muted mb-1 flex items-center gap-1">
                                            <Trophy size={12} /> Record
                                        </div>
                                        <div className="font-bold flex gap-1 text-sm">
                                            <span className="text-green-500">{team.wins}W</span>
                                            <span className="text-red-500">{team.losses}L</span>
                                            <span className="text-slate-400">{team.draws}D</span>
                                        </div>
                                    </div>
                                    <div className="bg-[hsl(var(--background)/0.5)] p-3 rounded-xl border border-[hsl(var(--border))]">
                                        <div className="text-xs text-muted mb-1 flex items-center gap-1">
                                            <Swords size={12} /> Goal Diff
                                        </div>
                                        <div className={`font-bold text-lg ${team.goalDifference > 0 ? 'text-green-500' : team.goalDifference < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                                            {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-xs text-muted">
                                    <span>{team.gamesPlayed} Games Played</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} /> {new Date(team.lastPlayed).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
