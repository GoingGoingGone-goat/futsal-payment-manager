import { getData } from '@/lib/storage';
import OpponentLadder from '@/components/OpponentLadder';

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
    const data = await getData();

    // Extract available seasons from games, ensuring Season 6 is present
    const seasonSet = new Set<string>();
    data.games.forEach(g => {
        if (g.season) seasonSet.add(g.season);
    });
    seasonSet.add('Season 6');

    // Sort seasons in descending order (Season 6, Season 5, etc.)
    const availableSeasons = Array.from(seasonSet).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numB - numA;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Opponents
                </h1>
                <p className="text-muted">
                    Head-to-head difficulty and opponent history.
                </p>
            </header>

            <OpponentLadder 
                initialGames={data.games} 
                availableSeasons={availableSeasons}
                currentDefaultSeason="Season 6"
            />
        </div>
    );
}
