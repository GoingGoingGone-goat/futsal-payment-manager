import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { sql } from '@vercel/postgres';

const DATA_FILE = path.join(process.cwd(), 'data.json');
const USE_DB = !!process.env.POSTGRES_URL || !!process.env.DATABASE_URL;

export interface Player {
    id: string;
    name: string;
}

export interface PlayerPerformance {
    playerId: string;
    goals: number;
}

export interface Game {
    id: string;
    date: string;
    opponent: string;
    score: string;
    players: PlayerPerformance[];
    costPerPlayer: number;
    season: string;
}

export interface Payment {
    id: string;
    playerId: string;
    amount: number;
    date: string;
    season: string;
}

export interface Fee {
    id: string;
    playerId: string;
    amount: number;
    description: string;
    date: string;
    season: string;
}

export interface Schema {
    players: Player[];
    games: Game[];
    payments: Payment[];
    fees: Fee[];
}

const defaultData: Schema = {
    players: [],
    games: [],
    payments: [],
    fees: []
};

// --- Local Storage Implementation ---

async function ensureFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
    }
}

const getLocalData = async (): Promise<Schema> => {
    try {
        await fs.access(DATA_FILE); // Check if file exists
    } catch {
        return { players: [], games: [], payments: [], fees: [] }; // If not, return empty schema
    }
    const rawData = await fs.readFile(DATA_FILE, 'utf-8');
    const data = JSON.parse(rawData);

    // Ensure fees array exists for legacy JSON
    if (!data.fees) data.fees = [];

    // Ensure fees array exists for legacy JSON
    if (!data.fees) data.fees = [];

    // Migration for legacy data (playerIds -> players)
    if (data.games) {
        data.games = data.games.map((g: any) => {
            if (g.playerIds && !g.players) {
                return {
                    ...g,
                    players: g.playerIds.map((pid: string) => ({ playerId: pid, goals: 0 }))
                };
            }
            return g;
        });
    }

    return data;
}

async function saveLocalData(data: Schema) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// --- DB Implementation ---

async function getDbData(): Promise<Schema> {
    try {
        const [playersRes, gamesRes, paymentsRes, gamePlayersRes] = await Promise.all([
            sql`SELECT * FROM players`,
            sql`SELECT * FROM games`,
            sql`SELECT * FROM payments`,
            sql`SELECT * FROM game_players`
        ]);

        const players: Player[] = playersRes.rows.map(row => ({
            id: row.id,
            name: row.name,
            totalCost: 0, // Calculated later
            totalPaid: 0, // Calculated later
            owed: 0,      // Calculated later
            gamesPlayed: 0 // Calculated later
        }));

        const games: Game[] = gamesRes.rows.map(row => ({
            id: row.id,
            date: row.date,
            opponent: row.opponent,
            score: row.score,
            costPerPlayer: Number(row.cost_per_player),
            season: row.season || 'Season 3', // Default for legacy rows
            players: gamePlayersRes.rows
                .filter(gp => gp.game_id === row.id)
                .map(gp => ({
                    playerId: gp.player_id,
                    goals: Number(gp.goals || 0)
                }))
        }));

        const payments: Payment[] = paymentsRes.rows.map(row => ({
            id: row.id,
            playerId: row.player_id,
            amount: Number(row.amount),
            date: row.date,
            season: row.season || 'Season 3' // Default for legacy rows
        }));

        // Fetch fees (if table exists, otherwise empty)
        let fees: Fee[] = [];
        try {
            const feesRes = await sql`SELECT * FROM fees`;
            fees = feesRes.rows.map(row => ({
                id: row.id,
                playerId: row.player_id,
                amount: Number(row.amount),
                description: row.description,
                date: row.date,
                season: row.season
            }));
        } catch (e) {
            // Table might not exist yet, or other DB error. Log and proceed with empty fees.
            console.warn("Could not fetch fees, table might not exist or other error:", e);
        }

        return {
            players,
            games,
            payments,
            fees
        };
    } catch (e) {
        console.error("DB Error:", e);
        return defaultData;
    }
}

// --- Public API ---

export async function getData(): Promise<Schema> {
    return USE_DB ? getDbData() : getLocalData();
}

export async function addPlayer(name: string) {
    const id = randomUUID();
    if (USE_DB) {
        await sql`INSERT INTO players (id, name) VALUES (${id}, ${name})`;
        return { id, name };
    } else {
        const data = await getLocalData();
        const newPlayer = { id, name };
        data.players.push(newPlayer);
        await saveLocalData(data);
        return newPlayer;
    }
}

export async function addGame(game: Omit<Game, 'id'>) {
    const id = randomUUID();
    if (USE_DB) {
        await sql`INSERT INTO games (id, date, opponent, score, cost_per_player, season) VALUES (${id}, ${game.date}, ${game.opponent}, ${game.score}, ${game.costPerPlayer}, ${game.season})`;

        for (const p of game.players) {
            await sql`INSERT INTO game_players (game_id, player_id, goals) VALUES (${id}, ${p.playerId}, ${p.goals})`;
        }

        return { ...game, id };
    } else {
        const data = await getLocalData();
        const newGame = {
            ...game,
            id,
            season: game.season || 'Season 3'
        };
        data.games.push(newGame);
        await saveLocalData(data);
        return newGame;
    }
}

export async function addPayment(payment: Omit<Payment, 'id'>) {
    const id = randomUUID();
    if (USE_DB) {
        await sql`INSERT INTO payments (id, player_id, amount, date, season) VALUES (${id}, ${payment.playerId}, ${payment.amount}, ${payment.date}, ${payment.season})`;
        return { ...payment, id };
    } else {
        const data = await getLocalData();
        const newPayment = {
            ...payment,
            id,
            season: payment.season || 'Season 3'
        };
        data.payments.push(newPayment);
        await saveLocalData(data);
        return newPayment;
    }
}

export function calculatePlayerStats(data: Schema, playerId: string) {
    const playedGames = data.games.filter(g => g.players.some(p => p.playerId === playerId));
    const payments = data.payments.filter(p => p.playerId === playerId);
    const fees = data.fees.filter(f => f.playerId === playerId);

    const gameCost = playedGames.reduce((sum, g) => sum + g.costPerPlayer, 0);
    const feeCost = fees.reduce((sum, f) => sum + f.amount, 0);
    const totalCost = gameCost + feeCost;

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    const goalsScored = playedGames.reduce((sum, g) => {
        const playerPerf = g.players.find(p => p.playerId === playerId);
        return sum + (playerPerf?.goals || 0);
    }, 0);

    // Group by Season
    const seasons: Record<string, { gamesPlayed: number, goalsScored: number, totalCost: number, totalPaid: number, owed: number }> = {};

    // Initialize seasons from games
    playedGames.forEach(g => {
        const s = g.season || 'Season 3';
        if (!seasons[s]) seasons[s] = { gamesPlayed: 0, goalsScored: 0, totalCost: 0, totalPaid: 0, owed: 0 };

        seasons[s].gamesPlayed++;
        seasons[s].totalCost += g.costPerPlayer;

        const playerPerf = g.players.find(p => p.playerId === playerId);
        seasons[s].goalsScored += (playerPerf?.goals || 0);
    });

    // Update seasons from fees
    fees.forEach(f => {
        const s = f.season || 'Season 3';
        if (!seasons[s]) seasons[s] = { gamesPlayed: 0, goalsScored: 0, totalCost: 0, totalPaid: 0, owed: 0 };
        seasons[s].totalCost += f.amount;
    });

    // Initialize/Update seasons from payments
    payments.forEach(p => {
        const s = p.season || 'Season 3';
        if (!seasons[s]) seasons[s] = { gamesPlayed: 0, goalsScored: 0, totalCost: 0, totalPaid: 0, owed: 0 };
        seasons[s].totalPaid += p.amount;
    });

    // Calculate owed per season
    Object.keys(seasons).forEach(s => {
        seasons[s].owed = seasons[s].totalCost - seasons[s].totalPaid;
    });

    return {
        gamesPlayed: playedGames.length,
        goalsScored,
        totalCost,
        totalPaid,
        owed: totalCost - totalPaid,
        seasons,
        history: {
            games: playedGames,
            payments: payments,
            fees: fees
        }
    };
}

export async function getPlayerStats(playerId: string) {
    const data = await getData();
    return calculatePlayerStats(data, playerId);
}

export async function addFee(fee: Omit<Fee, 'id'>) {
    const id = randomUUID();
    if (USE_DB) {
        await sql`INSERT INTO fees (id, player_id, amount, description, date, season) VALUES (${id}, ${fee.playerId}, ${fee.amount}, ${fee.description}, ${fee.date}, ${fee.season})`;
        return { ...fee, id };
    } else {
        const data = await getLocalData();
        const newFee = { ...fee, id };
        data.fees.push(newFee);
        await saveLocalData(data);
        return newFee;
    }
}

export async function deletePlayer(id: string) {
    if (USE_DB) {
        await sql`DELETE FROM game_players WHERE player_id = ${id}`;
        await sql`DELETE FROM payments WHERE player_id = ${id}`;
        await sql`DELETE FROM fees WHERE player_id=${id}`;
        await sql`DELETE FROM players WHERE id = ${id}`;
    } else {
        const data = await getLocalData();
        data.players = data.players.filter(p => p.id !== id);
        data.payments = data.payments.filter(p => p.playerId !== id);
        data.fees = data.fees.filter(f => f.playerId !== id);
        // Remove from games
        data.games.forEach(g => {
            g.players = g.players.filter(p => p.playerId !== id);
        });
        await saveLocalData(data);
    }
}

export async function deleteGame(id: string) {
    if (USE_DB) {
        await sql`DELETE FROM game_players WHERE game_id = ${id}`;
        await sql`DELETE FROM games WHERE id = ${id}`;
    } else {
        const data = await getLocalData();
        data.games = data.games.filter(g => g.id !== id);
        await saveLocalData(data);
    }
}

export async function deletePayment(id: string) {
    if (USE_DB) {
        await sql`DELETE FROM payments WHERE id = ${id}`;
    } else {
        const data = await getLocalData();
        data.payments = data.payments.filter(p => p.id !== id);
        await saveLocalData(data);
    }
}

export async function deleteFee(id: string) {
    if (USE_DB) {
        await sql`DELETE FROM fees WHERE id=${id}`;
    } else {
        const data = await getLocalData();
        data.fees = data.fees.filter(f => f.id !== id);
        await saveLocalData(data);
    }
}

// --- Update Functions ---

export async function updatePlayer(id: string, name: string) {
    if (USE_DB) {
        await sql`UPDATE players SET name = ${name} WHERE id = ${id}`;
        return { id, name };
    } else {
        const data = await getLocalData();
        const player = data.players.find(p => p.id === id);
        if (player) {
            player.name = name;
            await saveLocalData(data);
        }
        return player;
    }
}

export async function updateGame(id: string, gameData: Partial<Game>) {
    if (USE_DB) {
        // Construct dynamic query parts
        if (gameData.date) await sql`UPDATE games SET date = ${gameData.date} WHERE id = ${id}`;
        if (gameData.opponent) await sql`UPDATE games SET opponent = ${gameData.opponent} WHERE id = ${id}`;
        if (gameData.score) await sql`UPDATE games SET score = ${gameData.score} WHERE id = ${id}`;
        if (gameData.season) await sql`UPDATE games SET season = ${gameData.season} WHERE id = ${id}`;

        // Note: Editing actual players/goals in a game is complex and skipped for now in this function
        // unless we want to do a full delete/re-insert of game_players which is safer but heavier.

        return { id, ...gameData };
    } else {
        const data = await getLocalData();
        const game = data.games.find(g => g.id === id);
        if (game) {
            if (gameData.date) game.date = gameData.date;
            if (gameData.opponent) game.opponent = gameData.opponent;
            if (gameData.score) game.score = gameData.score;
            if (gameData.season) game.season = gameData.season;
            await saveLocalData(data);
        }
        return game;
    }
}

// --- Advanced Analytics ---

export interface AdvancedStats {
    efficiency: { id: string; name: string; value: number }[];
    totalGoals: { id: string; name: string; value: number }[];
    gamesPlayed: { id: string; name: string; value: number }[];
    luckyCharm: { id: string; name: string; value: number }[];
    clutchFactor: { id: string; name: string; value: number }[];
    fightingSpirit: { id: string; name: string; value: number }[];
}

export function getAdvancedStats(data: Schema, seasonFilter?: string): AdvancedStats {
    const stats = data.players.map(player => {
        // Filter games by season if provided
        const allGames = data.games;
        const relevantGames = (seasonFilter && seasonFilter !== 'All')
            ? allGames.filter(g => g.season === seasonFilter)
            : allGames;

        const games = relevantGames.filter(g => g.players.some(p => p.playerId === player.id));
        const totalGames = games.length;

        let goalsInWins = 0;
        let goalsInLosses = 0;
        let totalGoals = 0;
        let wins = 0;

        games.forEach(g => {
            const playerPerf = g.players.find(p => p.playerId === player.id);
            const goals = playerPerf?.goals || 0;
            totalGoals += goals;

            // Simple score parsing "X-Y" -> Our Score X, Opponent Score Y
            const parts = g.score?.split('-').map(s => parseInt(s.trim()));
            if (parts && parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                const [ourScore, theirScore] = parts;
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
            wins
        };
    });

    // 1. Efficiency (Goals/Game, min 3 games)
    const efficiency = stats
        .filter(s => s.totalGames >= 3)
        .map(s => ({ ...s, value: s.totalGoals / s.totalGames }))
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
        .filter(s => s.totalGames >= 3)
        .map(s => ({ ...s, value: (s.wins / s.totalGames) * 100 }))
        .sort((a, b) => b.value - a.value);

    // 5. Clutch Factor (% goals in wins)
    const clutchFactor = stats
        .filter(s => s.totalGoals > 0 && s.totalGames >= 3)
        .map(s => ({ ...s, value: (s.goalsInWins / s.totalGoals) * 100 }))
        .sort((a, b) => b.value - a.value);

    // 6. Fighting Spirit (% goals in losses)
    const fightingSpirit = stats
        .filter(s => s.totalGoals > 0 && s.totalGames >= 3)
        .map(s => ({ ...s, value: (s.goalsInLosses / s.totalGoals) * 100 }))
        .sort((a, b) => b.value - a.value);

    return {
        efficiency,
        totalGoals,
        gamesPlayed,
        luckyCharm,
        clutchFactor,
        fightingSpirit
    };
}

// --- Team Stats ---

export interface TeamStats {
    name: string;
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    goalsScored: number;
    goalsConceded: number;
    lastPlayed: string;
    goalDifference: number;
}

export async function getAllTeamStats(): Promise<TeamStats[]> {
    const data = await getData();
    const teams: Record<string, TeamStats> = {};

    data.games.forEach(game => {
        const opponent = game.opponent;
        if (!teams[opponent]) {
            teams[opponent] = {
                name: opponent,
                gamesPlayed: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                goalsScored: 0,
                goalsConceded: 0,
                lastPlayed: game.date,
                goalDifference: 0
            };
        }

        const stats = teams[opponent];
        stats.gamesPlayed++;

        if (new Date(game.date) > new Date(stats.lastPlayed)) {
            stats.lastPlayed = game.date;
        }

        // Parse Score "Us - Them"
        const parts = game.score.split('-').map(s => parseInt(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            const [us, them] = parts;
            stats.goalsScored += us;
            stats.goalsConceded += them;

            if (us > them) stats.wins++;
            else if (us < them) stats.losses++;
            else stats.draws++;
        }
    });

    return Object.values(teams).map(t => ({
        ...t,
        goalDifference: t.goalsScored - t.goalsConceded
    })).sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime());
}

// --- Synergy Analytics ---

export interface SynergyStats {
    theCore: { playerIds: string[]; playerNames: string[]; value: number }[];
    matchWinners: { playerIds: string[]; playerNames: string[]; value: number; gamesPlayed: number }[];
    theWall: { playerIds: string[]; playerNames: string[]; value: number; gamesPlayed: number }[];
}

export function getSynergyStats(data: Schema, seasonFilter?: string): SynergyStats {
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

        // Generate combinations of 3
        if (pIds.length >= 3) {
            for (let i = 0; i < pIds.length - 2; i++) {
                for (let j = i + 1; j < pIds.length - 1; j++) {
                    for (let k = j + 1; k < pIds.length; k++) {
                        const trio = [pIds[i], pIds[j], pIds[k]];
                        const key = trio.join(',');

                        if (!trioStats[key]) {
                            trioStats[key] = { playerIds: trio, games: 0, wins: 0, goalsConceded: 0 };
                        }

                        trioStats[key].games++;

                        // Parse Score
                        const parts = game.score.split('-').map(s => parseInt(s.trim()));
                        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                            const [us, them] = parts;
                            trioStats[key].goalsConceded += them;
                            if (us > them) trioStats[key].wins++;
                        }
                    }
                }
            }
        }
    });

    const allTrios = Object.values(trioStats).map(t => ({
        ...t,
        playerNames: t.playerIds.map(id => playerMap.get(id) || 'Unknown')
    }));

    // 1. The Core (Most Games)
    const theCore = [...allTrios]
        .sort((a, b) => b.games - a.games)
        .slice(0, 5)
        .map(t => ({ playerIds: t.playerIds, playerNames: t.playerNames, value: t.games }));

    // 2. Match Winners (Win %, min 3 games)
    const matchWinners = [...allTrios]
        .filter(t => t.games >= 3)
        .map(t => ({ ...t, value: (t.wins / t.games) * 100 }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
        .map(t => ({ playerIds: t.playerIds, playerNames: t.playerNames, value: t.value, gamesPlayed: t.games }));

    // 3. The Wall (Avg Goals Conceded, min 3 games)
    const theWall = [...allTrios]
        .filter(t => t.games >= 3)
        .map(t => ({ ...t, value: t.goalsConceded / t.games }))
        .sort((a, b) => a.value - b.value) // Lower is better
        .slice(0, 5)
        .map(t => ({ playerIds: t.playerIds, playerNames: t.playerNames, value: t.value, gamesPlayed: t.games }));

    return { theCore, matchWinners, theWall };
}
