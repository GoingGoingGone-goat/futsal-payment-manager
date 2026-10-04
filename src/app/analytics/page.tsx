import { getData } from '@/lib/storage';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
    const data = await getData();

    // Extract available seasons
    const seasonSet = new Set<string>();
    data.games.forEach(g => {
        if (g.season) seasonSet.add(g.season);
    });
    seasonSet.add('Season 6');
    seasonSet.add('Season 5');

    const availableSeasons = Array.from(seasonSet).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numB - numA;
    });

    return (
        <AnalyticsDashboard 
            initialData={data} 
            availableSeasons={availableSeasons} 
        />
    );
}
