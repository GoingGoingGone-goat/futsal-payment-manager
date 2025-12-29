import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { sql } from '@vercel/postgres';

const DATA_FILE = path.join(process.cwd(), 'data.json');
const USE_DB = !!process.env.POSTGRES_URL;

export interface Player {
    id: string;
    name: string;
}

export interface Game {
    id: string;
    date: string;
    opponent: string;
    score: string;
    playerIds: string[];
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
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
}

async function saveLocalData(data: Schema) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// --- DB Implementation ---

async function getDbData(): Promise<Schema> {
    try {
        // Parallelize queries for performance
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
            playerIds: gamePlayersRes.rows
                .filter(gp => gp.game_id === row.id)
                .map(gp => gp.player_id)
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
        // Fallback to empty if DB fails or tables don't exist yet
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

        // Insert relations
        for (const pid of game.playerIds) {
            await sql`INSERT INTO game_players (game_id, player_id) VALUES (${id}, ${pid})`;
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
    // Re-use logic from getData because it aggregates efficiently in memory for MVP.
    // In a large scale app, we would write specific SQL queries here (e.g. SUM(amount)).
    const data = await getData();

    const playedGames = data.games.filter(g => g.playerIds.includes(playerId));
    const payments = data.payments.filter(p => p.playerId === playerId);

    const totalCost = playedGames.reduce((sum, g) => sum + g.costPerPlayer, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    return {
        gamesPlayed: playedGames.length,
        totalCost,
        totalPaid,
        owed: totalCost - totalPaid,
        history: {
            games: playedGames,
            payments: payments
        }
    };
}
