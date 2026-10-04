import type { Schema } from './storage';

export interface GoalkeeperStatItem {
    id: string;
    name: string;
    value: number;
    gamesAsGk: number;
    subValue?: string;
}

export interface AdvancedStats {
    efficiency: { id: string; name: string; value: number }[];
    totalGoals: { id: string; name: string; value: number }[];
    gamesPlayed: { id: string; name: string; value: number }[];
    luckyCharm: { id: string; name: string; value: number }[];
    clutchFactor: { id: string; name: string; value: number }[];
    fightingSpirit: { id: string; name: string; value: number }[];
    defensiveRating: { id: string; name: string; value: number }[];
    netRating: { id: string; name: string; value: number }[];
    offensiveRating: { id: string; name: string; value: number }[];
    moneyPerGame: { id: string; name: string; value: number }[];
    gkAppearances: GoalkeeperStatItem[];
    gkWinPct: GoalkeeperStatItem[];
    gkGoalsConcededPerGame: GoalkeeperStatItem[];
}

export function getAdvancedStats(data: Schema, seasonFilter?: string, minGames: number = 3): AdvancedStats {
    // Filter games by season if provided
    const relevantGames = (seasonFilter && seasonFilter !== 'All')
        ? data.games.filter(g => g.season === seasonFilter)
        : data.games;

    const stats = data.players.map(player => {
        const games = relevantGames.filter(g => g.players.some(p => p.playerId === player.id));
        const totalGames = games.length;

        let goalsInWins = 0;
        let goalsInLosses = 0;
        let totalGoals = 0;
        let wins = 0;

        // New stats for Ratings
        let teamGoalsFor = 0;
        let teamGoalsAgainst = 0;

        games.forEach(g => {
            const playerPerf = g.players.find(p => p.playerId === player.id);
            const goals = playerPerf?.goals || 0;
            totalGoals += goals;

            // Simple score parsing "X-Y" -> Our Score X, Opponent Score Y
            const parts = g.score?.split('-').map(s => parseInt(s.trim()));
            if (parts && parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                const [ourScore, theirScore] = parts;

                teamGoalsFor += ourScore;
                teamGoalsAgainst += theirScore;

                if (ourScore > theirScore) {
                    wins++;
                    goalsInWins += goals;
                } else if (ourScore < theirScore) {
                    goalsInLosses += goals;
                }
            }
        });

        return {
            id: player.id,
            name: player.name,
            totalGames,
            totalGoals,
            goalsInWins,
            goalsInLosses,
            wins,
            teamGoalsFor,
            teamGoalsAgainst
        };
    });

    // 1. Efficiency (Goals/Game, min games)
    const efficiency = stats
        .filter(s => s.totalGames >= minGames)
        .map(s => ({ ...s, value: s.totalGames > 0 ? s.totalGoals / s.totalGames : 0 }))
        .sort((a, b) => b.value - a.value);

    // 2. Total Goals
    const totalGoals = stats
        .map(s => ({ ...s, value: s.totalGoals }))
        .sort((a, b) => b.value - a.value);

    // 3. Games Played
    const gamesPlayed = stats
        .map(s => ({ ...s, value: s.totalGames }))
        .sort((a, b) => b.value - a.value);

    // 4. Lucky Charm (Win %)
    const luckyCharm = stats
        .filter(s => s.totalGames >= minGames)
        .map(s => ({ ...s, value: s.totalGames > 0 ? (s.wins / s.totalGames) * 100 : 0 }))
        .sort((a, b) => b.value - a.value);

    // 5. Clutch Factor (% goals in wins)
    const clutchFactor = stats
        .filter(s => s.totalGoals > 0 && s.totalGames >= minGames)
        .map(s => ({ ...s, value: s.totalGoals > 0 ? (s.goalsInWins / s.totalGoals) * 100 : 0 }))
        .sort((a, b) => b.value - a.value);

    // 6. Fighting Spirit (% goals in losses)
    const fightingSpirit = stats
        .filter(s => s.totalGoals > 0 && s.totalGames >= minGames)
        .map(s => ({ ...s, value: s.totalGoals > 0 ? (s.goalsInLosses / s.totalGoals) * 100 : 0 }))
        .sort((a, b) => b.value - a.value);

    // 7. Defensive Rating (Avg Goals Conceded, Lower is Better)
    const defensiveRating = stats
        .filter(s => s.totalGames >= minGames)
        .map(s => ({ ...s, value: s.totalGames > 0 ? s.teamGoalsAgainst / s.totalGames : 0 }))
        .sort((a, b) => a.value - b.value);

    // 8. Offensive Rating (Avg Goals Scored, Higher is Better)
    const offensiveRating = stats
        .filter(s => s.totalGames >= minGames)
        .map(s => ({ ...s, value: s.totalGames > 0 ? s.teamGoalsFor / s.totalGames : 0 }))
        .sort((a, b) => b.value - a.value);

    // 9. Net Rating (Avg Goal Diff, Higher is Better)
    const netRating = stats
        .filter(s => s.totalGames >= minGames)
        .map(s => ({ ...s, value: s.totalGames > 0 ? (s.teamGoalsFor - s.teamGoalsAgainst) / s.totalGames : 0 }))
        .sort((a, b) => b.value - a.value);

    // 10. Money / Game (calculated after Season 2, min games)
    let relevantMoneyGames = data.games;
    let relevantPayments = data.payments || [];
    let relevantFees = data.fees || [];

    if (!seasonFilter || seasonFilter === 'All') {
        relevantMoneyGames = relevantMoneyGames.filter(g => g.season !== 'Season 1' && g.season !== 'Season 2');
        relevantPayments = relevantPayments.filter(p => p.season !== 'Season 1' && p.season !== 'Season 2');
        relevantFees = relevantFees.filter(f => f.season !== 'Season 1' && f.season !== 'Season 2');
    } else if (seasonFilter === 'Season 1' || seasonFilter === 'Season 2') {
        relevantMoneyGames = [];
        relevantPayments = [];
        relevantFees = [];
    } else {
        relevantMoneyGames = relevantMoneyGames.filter(g => g.season === seasonFilter);
        relevantPayments = relevantPayments.filter(p => p.season === seasonFilter);
        relevantFees = relevantFees.filter(f => f.season === seasonFilter);
    }

    const moneyPerGame = data.players
        .map(player => {
            const playerGames = relevantMoneyGames.filter(g => g.players.some(p => p.playerId === player.id));
            const gamesCount = playerGames.length;
            const playerPayments = relevantPayments.filter(p => p.playerId === player.id);
            const playerFees = relevantFees.filter(f => f.playerId === player.id);

            const gameCost = playerGames.reduce((sum, g) => sum + g.costPerPlayer, 0);
            const feeCost = playerFees.reduce((sum, f) => sum + f.amount, 0);
            const totalCost = gameCost + feeCost;
            const totalPaid = playerPayments.reduce((sum, p) => sum + p.amount, 0);
            const owed = Math.max(0, totalCost - totalPaid);

            const value = gamesCount > 0 ? (totalPaid + owed) / gamesCount : 0;

            return {
                id: player.id,
                name: player.name,
                gamesCount,
                value
            };
        })
        .filter(s => s.gamesCount >= minGames)
        .sort((a, b) => b.value - a.value)
        .map(({ id, name, value }) => ({ id, name, value }));

    // 11. Goalkeeper Analytics (calculated dynamically from match records)
    const gkMap = new Map<string, {
        id: string;
        name: string;
        gamesAsGk: number;
        winsAsGk: number;
        goalsConceded: number;
    }>();

    data.players.forEach(p => {
        gkMap.set(p.id, {
            id: p.id,
            name: p.name,
            gamesAsGk: 0,
            winsAsGk: 0,
            goalsConceded: 0
        });
    });

    relevantGames.forEach(g => {
        if (!g.goalkeeperId) return;
        const entry = gkMap.get(g.goalkeeperId);
        if (!entry) return;

        entry.gamesAsGk++;

        const parts = g.score?.split('-').map(s => parseInt(s.trim()));
        if (parts && parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            const [ourScore, theirScore] = parts;
            entry.goalsConceded += theirScore;
            if (ourScore > theirScore) {
                entry.winsAsGk++;
            }
        }
    });

    const activeGks = Array.from(gkMap.values()).filter(g => g.gamesAsGk > 0);

    // 1. Goalkeeper Appearances
    const gkAppearances: GoalkeeperStatItem[] = [...activeGks]
        .map(g => ({
            id: g.id,
            name: g.name,
            value: g.gamesAsGk,
            gamesAsGk: g.gamesAsGk,
            subValue: `${g.gamesAsGk} ${g.gamesAsGk === 1 ? 'appearance' : 'appearances'}`
        }))
        .sort((a, b) => b.value - a.value);

    // 2. Goalkeeper Win % (Shows win % and number of games)
    const gkWinPct: GoalkeeperStatItem[] = [...activeGks]
        .map(g => ({
            id: g.id,
            name: g.name,
            value: g.gamesAsGk > 0 ? (g.winsAsGk / g.gamesAsGk) * 100 : 0,
            gamesAsGk: g.gamesAsGk,
            subValue: `${g.gamesAsGk} ${g.gamesAsGk === 1 ? 'game' : 'games'}`
        }))
        .sort((a, b) => {
            if (b.value !== a.value) return b.value - a.value;
            return b.gamesAsGk - a.gamesAsGk;
        });

    // 3. Goalkeeper Defensive Ranking (Goals conceded per game, lower is better)
    const gkGoalsConcededPerGame: GoalkeeperStatItem[] = [...activeGks]
        .map(g => ({
            id: g.id,
            name: g.name,
            value: g.gamesAsGk > 0 ? g.goalsConceded / g.gamesAsGk : 0,
            gamesAsGk: g.gamesAsGk,
            subValue: `${g.gamesAsGk} ${g.gamesAsGk === 1 ? 'game' : 'games'}`
        }))
        .sort((a, b) => {
            if (a.value !== b.value) return a.value - b.value;
            return b.gamesAsGk - a.gamesAsGk;
        });

    return {
        efficiency,
        totalGoals,
        gamesPlayed,
        luckyCharm,
        clutchFactor,
        fightingSpirit,
        defensiveRating,
        offensiveRating,
        netRating,
        moneyPerGame,
        gkAppearances,
        gkWinPct,
        gkGoalsConcededPerGame
    };
}

// --- Synergy Analytics ---

export interface SynergyStats {
    theCore: { playerIds: string[]; playerNames: string[]; value: number }[];
    matchWinners: { playerIds: string[]; playerNames: string[]; value: number; gamesPlayed: number }[];
    theWall: { playerIds: string[]; playerNames: string[]; value: number; gamesPlayed: number }[];
}

// Helper to generate combinations of k elements
function getCombinations<T>(array: T[], k: number): T[][] {
    const result: T[][] = [];

    function backtrack(start: number, current: T[]) {
        if (current.length === k) {
            result.push([...current]);
            return;
        }

        for (let i = start; i < array.length; i++) {
            current.push(array[i]);
            backtrack(i + 1, current);
            current.pop();
        }
    }

    backtrack(0, []);
    return result;
}

export function getSynergyStats(data: Schema, seasonFilter?: string, minGames: number = 3, groupSize: number = 3): SynergyStats {
    const trioStats: Record<string, { playerIds: string[]; games: number; wins: number; goalsConceded: number }> = {};
    const playerMap = new Map<string, string>();
    data.players.forEach(p => playerMap.set(p.id, p.name));

    // Filter games by season if provided
    const games = (seasonFilter && seasonFilter !== 'All')
        ? data.games.filter(g => g.season === seasonFilter)
        : data.games;

    games.forEach(game => {
        // Get all player IDs in this game
        const pIds = game.players.map(p => p.playerId).sort();

        // Generate combinations found in this game
        if (pIds.length >= groupSize) {
            const combinations = getCombinations(pIds, groupSize);

            combinations.forEach(combo => {
                const key = combo.join(',');

                if (!trioStats[key]) {
                    trioStats[key] = { playerIds: combo, games: 0, wins: 0, goalsConceded: 0 };
                }

                trioStats[key].games++;

                // Parse Score
                const parts = game.score.split('-').map(s => parseInt(s.trim()));
                if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                    const [us, them] = parts;
                    trioStats[key].goalsConceded += them;
                    if (us > them) trioStats[key].wins++;
                }
            });
        }
    });

    const allGroups = Object.values(trioStats).map(t => ({
        ...t,
        playerNames: t.playerIds.map(id => playerMap.get(id) || 'Unknown')
    }));

    // 1. The Core (Most Games)
    const theCore = [...allGroups]
        .sort((a, b) => b.games - a.games)
        .slice(0, 5)
        .map(t => ({ playerIds: t.playerIds, playerNames: t.playerNames, value: t.games }));

    // 2. Match Winners (Win %, min games)
    const matchWinners = [...allGroups]
        .filter(t => t.games >= minGames)
        .map(t => ({ ...t, value: t.games > 0 ? (t.wins / t.games) * 100 : 0 }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
        .map(t => ({ playerIds: t.playerIds, playerNames: t.playerNames, value: t.value, gamesPlayed: t.games }));

    // 3. The Wall (Avg Goals Conceded, min games)
    const theWall = [...allGroups]
        .filter(t => t.games >= minGames)
        .map(t => ({ ...t, value: t.games > 0 ? t.goalsConceded / t.games : 0 }))
        .sort((a, b) => a.value - b.value) // Lower is better
        .slice(0, 5)
        .map(t => ({ playerIds: t.playerIds, playerNames: t.playerNames, value: t.value, gamesPlayed: t.games }));

    return { theCore, matchWinners, theWall };
}
