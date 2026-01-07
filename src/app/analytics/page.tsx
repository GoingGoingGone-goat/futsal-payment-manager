import Link from 'next/link';
import { getAdvancedStats, getData, getSynergyStats } from '@/lib/storage';
import { BarChart3, Crown, Flame, Target, Trophy, Zap, Shield, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ season?: string }> }) {
    const { season } = await searchParams; // Await searchParams in Next.js 15
    const currentSeason = season || 'All';

    const data = await getData();

    // Sort logic handled in storage, just pass filter
    const stats = getAdvancedStats(data, currentSeason);
    const synergy = getSynergyStats(data, currentSeason);

    const SeasonTab = ({ label, value }: { label: string, value: string }) => {
        const isActive = currentSeason === value;
        return (
            <Link
                href={value === 'All' ? '/analytics' : `/analytics?season=${value}`}
                className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${isActive
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary)/0.3)]'
                        : 'bg-[hsl(var(--accent))] text-muted-foreground hover:bg-[hsl(var(--accent)/0.8)] hover:text-foreground'}
                `}
            >
                {label}
            </Link>
        );
    };

    const Leaderboard = ({ title, icon: Icon, data, suffix = '', precision = 0, description }: any) => (
        <div className="glass-card p-6 rounded-2xl flex flex-col h-full max-h-[500px]">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-[hsl(var(--secondary)/0.1)] text-[hsl(var(--secondary))]">
                    <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold">{title}</h3>
            </div>

            <p className="text-xs text-muted mb-4 h-[32px] leading-tight">{description}</p>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {data.map((player: any, index: number) => (
                    <div key={player.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <span className={`
                                w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0
                                ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                    index === 1 ? 'bg-slate-400/20 text-slate-400' :
                                        index === 2 ? 'bg-orange-700/20 text-orange-700' : 'text-muted'}
                            `}>
                                {index + 1}
                            </span>
                            <span className="font-medium group-hover:text-[hsl(var(--primary))] transition-colors truncate max-w-[120px]">
                                {player.name}
                            </span>
                        </div>
                        <span className="font-bold tabular-nums shrink-0">
                            {player.value.toFixed(precision)}{suffix}
                        </span>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="text-center text-muted text-sm py-8">
                        Not enough data
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Analytics</h1>
                    <p className="text-muted">Advanced player performance metrics.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <SeasonTab label="All Time" value="All" />
                    <SeasonTab label="Season 1" value="Season 1" />
                    <SeasonTab label="Season 2" value="Season 2" />
                    <SeasonTab label="Season 3" value="Season 3" />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Goals / Game (Efficiency) */}
                <Leaderboard
                    title="Efficiency"
                    icon={Target}
                    data={stats.efficiency}
                    precision={2}
                    suffix=" G/G"
                    description="Average goals scored per game (min. 3 games)."
                />

                {/* 2. Total Goals (Volume) */}
                <Leaderboard
                    title="Golden Boot"
                    icon={Trophy}
                    data={stats.totalGoals}
                    precision={0}
                    description="Total goals scored across all games."
                />

                {/* 3. Games Played (Reliability) */}
                <Leaderboard
                    title="Reliability"
                    icon={Shield}
                    data={stats.gamesPlayed}
                    precision={0}
                    description="Total number of games attended."
                />

                {/* 4. Lucky Charm (Win %) */}
                <Leaderboard
                    title="Lucky Charm"
                    icon={Crown}
                    data={stats.luckyCharm}
                    precision={1}
                    suffix="%"
                    description="% of games won when this player is playing (min 3 games)."
                />

                {/* 5. Clutch Factor (Goal Win %) */}
                <Leaderboard
                    title="Clutch Factor"
                    icon={Zap}
                    data={stats.clutchFactor}
                    precision={1}
                    suffix="%"
                    description="% of goals scored in winning games (min 3 games)."
                />

                {/* 6. Fighting Spirit (Goal Lose %) */}
                <Leaderboard
                    title="Fighting Spirit"
                    icon={Flame}
                    data={stats.fightingSpirit}
                    precision={1}
                    suffix="%"
                    description="% of goals scored in losing games (min 3 games)."
                />

            </div>

            {/* Team Synergy Section */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Users className="text-[hsl(var(--primary))]" /> Team Synergy <span className="text-sm font-normal text-muted">(Best Trios)</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* The Core */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Users size={24} /></div>
                            <h3 className="text-lg font-bold">The Core</h3>
                        </div>
                        <p className="text-xs text-muted mb-4">Trios with the most appearances together.</p>
                        <div className="space-y-3">
                            {synergy.theCore.map((trio, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-[hsl(var(--background)/0.5)] border border-[hsl(var(--border))]">
                                    <div className="text-sm font-medium">
                                        {trio.playerNames.join(', ')}
                                    </div>
                                    <div className="font-bold text-blue-500">{trio.value} Games</div>
                                </div>
                            ))}
                            {synergy.theCore.length === 0 && <p className="text-muted text-sm">Not enough data.</p>}
                        </div>
                    </div>

                    {/* Match Winners */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-lg bg-green-500/10 text-green-500"><Trophy size={24} /></div>
                            <h3 className="text-lg font-bold">Match Winners</h3>
                        </div>
                        <p className="text-xs text-muted mb-4">Highest Win % (min 3 games).</p>
                        <div className="space-y-3">
                            {synergy.matchWinners.map((trio, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-[hsl(var(--background)/0.5)] border border-[hsl(var(--border))]">
                                    <div className="text-sm font-medium">
                                        {trio.playerNames.join(', ')}
                                    </div>
                                    <div className="font-bold text-green-500">{trio.value.toFixed(1)}%</div>
                                </div>
                            ))}
                            {synergy.matchWinners.length === 0 && <p className="text-muted text-sm">Not enough data.</p>}
                        </div>
                    </div>

                    {/* The Wall */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-lg bg-red-500/10 text-red-500"><Shield size={24} /></div>
                            <h3 className="text-lg font-bold">The Wall</h3>
                        </div>
                        <p className="text-xs text-muted mb-4">Lowest Avg Goals Conceded (min 3 games).</p>
                        <div className="space-y-3">
                            {synergy.theWall.map((trio, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-[hsl(var(--background)/0.5)] border border-[hsl(var(--border))]">
                                    <div className="text-sm font-medium">
                                        {trio.playerNames.join(', ')}
                                    </div>
                                    <div className="font-bold text-red-500">{trio.value.toFixed(2)}</div>
                                </div>
                            ))}
                            {synergy.theWall.length === 0 && <p className="text-muted text-sm">Not enough data.</p>}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
