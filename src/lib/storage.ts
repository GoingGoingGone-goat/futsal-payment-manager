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
}

export interface Payment {
    id: string;
    playerId: string;
    amount: number;
    date: string;
}

export interface Schema {
    players: Player[];
    games: Game[];
    payments: Payment[];
}

const defaultData: Schema = {
    players: [],
    games: [],
    payments: []
};

// --- Local Storage Implementation ---

async function ensureFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
    }
}

async function getLocalData(): Promise<Schema> {
    await ensureFile();
    const rawData = await fs.readFile(DATA_FILE, 'utf-8');
    const data = JSON.parse(rawData);

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

        const games: Game[] = gamesRes.rows.map(row => ({
            id: row.id,
            date: row.date,
            opponent: row.opponent,
            score: row.score,
            costPerPlayer: Number(row.cost_per_player),
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
            date: row.date
        }));

        return {
            players: playersRes.rows as Player[],
            games,
            payments
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
        await sql`INSERT INTO games (id, date, opponent, score, cost_per_player) VALUES (${id}, ${game.date}, ${game.opponent}, ${game.score}, ${game.costPerPlayer})`;

        for (const p of game.players) {
            await sql`INSERT INTO game_players (game_id, player_id, goals) VALUES (${id}, ${p.playerId}, ${p.goals})`;
        }

        return { ...game, id };
    } else {
        const data = await getLocalData();
        const newGame = { ...game, id };
        data.games.push(newGame);
        await saveLocalData(data);
        return newGame;
    }
}

export async function addPayment(payment: Omit<Payment, 'id'>) {
    const id = randomUUID();
    if (USE_DB) {
        await sql`INSERT INTO payments (id, player_id, amount, date) VALUES (${id}, ${payment.playerId}, ${payment.amount}, ${payment.date})`;
        return { ...payment, id };
    } else {
        const data = await getLocalData();
        const newPayment = { ...payment, id };
        data.payments.push(newPayment);
        await saveLocalData(data);
        return newPayment;
    }
}

export async function getPlayerStats(playerId: string) {
    const data = await getData();

    const playedGames = data.games.filter(g => g.players.some(p => p.playerId === playerId));
    const payments = data.payments.filter(p => p.playerId === playerId);

    const totalCost = playedGames.reduce((sum, g) => sum + g.costPerPlayer, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    const goalsScored = playedGames.reduce((sum, g) => {
        const playerPerf = g.players.find(p => p.playerId === playerId);
        return sum + (playerPerf?.goals || 0);
    }, 0);

    return {
        gamesPlayed: playedGames.length,
        goalsScored,
        totalCost,
        totalPaid,
        owed: totalCost - totalPaid,
        history: {
            games: playedGames,
            payments: payments
        }
    };
}

export async function deletePlayer(id: string) {
    if (USE_DB) {
        await sql`DELETE FROM payments WHERE player_id = ${id}`;
        await sql`DELETE FROM game_players WHERE player_id = ${id}`;
        await sql`DELETE FROM players WHERE id = ${id}`;
    } else {
        const data = await getLocalData();
        data.players = data.players.filter(p => p.id !== id);
        data.payments = data.payments.filter(p => p.playerId !== id);
        data.games = data.games.map(g => ({
            ...g,
            players: g.players.filter(p => p.playerId !== id)
        }));
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
