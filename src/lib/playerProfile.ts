import { Schema, Game, Payment, Fee, Player } from '@/lib/storage';

export interface MostPlayedTeammate {
    id: string;
    name: string;
    sharedGames: number;
}

export interface PlayerProfileData {
    id: string;
    name: string;
    // Performance
    gamesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    playerWinPct: number;
    clubWinPct: number;
    winPctDiff: number;
    totalGoals: number;
    // Financials
    totalPaid: number;
    owed: number;
    avgMoneyPerGame: number;
    // Ratings
    offensiveRating: number;
    defensiveRating: number;
    netRating: number;
    // Teammates
    mostPlayedWith: MostPlayedTeammate[];
    // History
    history: {
        games: Game[];
        payments: Payment[];
        fees: Fee[];
    };
    // Seasons
    seasons: Record<string, { gamesPlayed: number; goalsScored: number; totalCost: number; totalPaid: number; owed: number }>;
}

/**
 * Dynamically computes a player's complete performance, financial, and rating stats
 * across their entire club history without modifying underlying records.
 */
export function getPlayerProfileData(data: Schema, playerId: string): PlayerProfileData | null {
    const player = data.players.find(p => p.id === playerId);
    if (!player) return null;

    const playedGames = data.games.filter(g => g.players.some(p => p.playerId === playerId));
    const payments = data.payments.filter(p => p.playerId === playerId);
    const fees = data.fees.filter(f => f.playerId === playerId);

    const gamesPlayed = playedGames.length;

    // Performance & Ratings calculation
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let totalGoals = 0;
    let teamGoalsFor = 0;
    let teamGoalsAgainst = 0;

    playedGames.forEach(g => {
        const perf = g.players.find(p => p.playerId === playerId);
        totalGoals += (perf?.goals || 0);

        const parts = g.score?.split(/[-:]/).map(s => parseInt(s.trim()));
        if (parts && parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            const [ourScore, theirScore] = parts;
            teamGoalsFor += ourScore;
            teamGoalsAgainst += theirScore;
            if (ourScore > theirScore) wins++;
            else if (ourScore < theirScore) losses++;
            else draws++;
        }
    });

    const playerWinPct = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;

    // Club overall win percentage
    let clubWins = 0;
    let clubGames = 0;
    data.games.forEach(g => {
        const parts = g.score?.split(/[-:]/).map(s => parseInt(s.trim()));
        if (parts && parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            clubGames++;
            if (parts[0] > parts[1]) clubWins++;
        }
    });
    const clubWinPct = clubGames > 0 ? (clubWins / clubGames) * 100 : 0;
    const winPctDiff = playerWinPct - clubWinPct;

    // Financials: Money Paid, Money Owed, Average Money per Game
    const gameCost = playedGames.reduce((sum, g) => sum + g.costPerPlayer, 0);
    const feeCost = fees.reduce((sum, f) => sum + f.amount, 0);
    const totalCost = gameCost + feeCost;
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const owed = Math.max(0, totalCost - totalPaid);

    // Average Money per Game is calculated only for games played after Season 2 (Season 3 onwards)
    const postS2Games = playedGames.filter(g => g.season !== 'Season 1' && g.season !== 'Season 2');
    const postS2GamesCount = postS2Games.length;
    const postS2GameCost = postS2Games.reduce((sum, g) => sum + g.costPerPlayer, 0);
    const postS2Fees = fees.filter(f => f.season !== 'Season 1' && f.season !== 'Season 2');
    const postS2FeeCost = postS2Fees.reduce((sum, f) => sum + f.amount, 0);
    const postS2Payments = payments.filter(p => p.season !== 'Season 1' && p.season !== 'Season 2');
    const postS2Paid = postS2Payments.reduce((sum, p) => sum + p.amount, 0);
    const postS2TotalCost = postS2GameCost + postS2FeeCost;
    const postS2Owed = Math.max(0, postS2TotalCost - postS2Paid);

    const avgMoneyPerGame = postS2GamesCount > 0 ? (postS2Paid + postS2Owed) / postS2GamesCount : 0;

    // Ratings: reusing exact formulas from Analytics / Power Rankings
    // Offensive Rating: Avg goals scored by team when player plays
    // Defensive Rating: Avg goals conceded by team when player plays
    // Net Rating: Avg goal difference when player plays
    const offensiveRating = gamesPlayed > 0 ? teamGoalsFor / gamesPlayed : 0;
    const defensiveRating = gamesPlayed > 0 ? teamGoalsAgainst / gamesPlayed : 0;
    const netRating = gamesPlayed > 0 ? (teamGoalsFor - teamGoalsAgainst) / gamesPlayed : 0;

    // Most Played With: Top 5 teammates shared in lineups
    const teammateCounts = new Map<string, number>();
    playedGames.forEach(g => {
        g.players.forEach(p => {
            if (p.playerId !== playerId) {
                teammateCounts.set(p.playerId, (teammateCounts.get(p.playerId) || 0) + 1);
            }
        });
    });

    const playerMap = new Map(data.players.map(p => [p.id, p]));

    const mostPlayedWith: MostPlayedTeammate[] = Array.from(teammateCounts.entries())
        .map(([id, count]) => {
            const tm = playerMap.get(id);
            const totalAppearances = data.games.filter(g => g.players.some(gp => gp.playerId === id)).length;
            return {
                id,
                name: tm ? tm.name : 'Unknown Player',
                sharedGames: count,
                totalGames: totalAppearances
            };
        })
        .sort((a, b) => {
            // Ties handled consistently: shared games desc, total appearances desc, then name asc
            if (b.sharedGames !== a.sharedGames) return b.sharedGames - a.sharedGames;
            if (b.totalGames !== a.totalGames) return b.totalGames - a.totalGames;
            return a.name.localeCompare(b.name);
        })
        .slice(0, 5)
        .map(({ id, name, sharedGames }) => ({ id, name, sharedGames }));

    // Season breakdown
    const seasons: Record<string, { gamesPlayed: number; goalsScored: number; totalCost: number; totalPaid: number; owed: number }> = {};
    playedGames.forEach(g => {
        const s = g.season || 'Season 6';
        if (!seasons[s]) seasons[s] = { gamesPlayed: 0, goalsScored: 0, totalCost: 0, totalPaid: 0, owed: 0 };
        seasons[s].gamesPlayed++;
        seasons[s].totalCost += g.costPerPlayer;
        const perf = g.players.find(p => p.playerId === playerId);
        seasons[s].goalsScored += (perf?.goals || 0);
    });

    fees.forEach(f => {
        const s = f.season || 'Season 6';
        if (!seasons[s]) seasons[s] = { gamesPlayed: 0, goalsScored: 0, totalCost: 0, totalPaid: 0, owed: 0 };
        seasons[s].totalCost += f.amount;
    });

    payments.forEach(p => {
        const s = p.season || 'Season 6';
        if (!seasons[s]) seasons[s] = { gamesPlayed: 0, goalsScored: 0, totalCost: 0, totalPaid: 0, owed: 0 };
        seasons[s].totalPaid += p.amount;
    });

    Object.keys(seasons).forEach(s => {
        seasons[s].owed = seasons[s].totalCost - seasons[s].totalPaid;
    });

    return {
        id: player.id,
        name: player.name,
        gamesPlayed,
        wins,
        draws,
        losses,
        playerWinPct,
        clubWinPct,
        winPctDiff,
        totalGoals,
        totalPaid,
        owed,
        avgMoneyPerGame,
        offensiveRating,
        defensiveRating,
        netRating,
        mostPlayedWith,
        history: {
            games: playedGames,
            payments,
            fees
        },
        seasons
    };
}
