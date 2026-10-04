import { sql } from '@vercel/postgres';
import { Schema, Game, Player } from './storage';
import { randomUUID } from 'crypto';

export interface HistoricalKeeperEntry {
    season: string;
    date: string;
    keeper: string;
}

export const HISTORICAL_GOALKEEPERS: HistoricalKeeperEntry[] = [
    { season: 'Season 1', date: '2024-09-10', keeper: 'James Lee' },
    { season: 'Season 1', date: '2024-09-17', keeper: 'Aiden Atlas' },
    { season: 'Season 1', date: '2024-09-24', keeper: 'Aiden Atlas' },
    { season: 'Season 1', date: '2024-10-01', keeper: 'Aiden Atlas' },
    { season: 'Season 1', date: '2024-10-08', keeper: 'Aiden Atlas' },
    { season: 'Season 1', date: '2024-10-15', keeper: 'Aiden Atlas' },
    { season: 'Season 1', date: '2024-10-22', keeper: 'Aiden Atlas' },
    { season: 'Season 1', date: '2024-11-12', keeper: 'Aiden Atlas' },
    { season: 'Season 1', date: '2024-11-19', keeper: 'Aiden Atlas' },
    { season: 'Season 1', date: '2024-12-03', keeper: 'Aiden Atlas' },
    { season: 'Season 1', date: '2024-12-10', keeper: 'Aiden Atlas' },
    { season: 'Season 1', date: '2024-12-17', keeper: 'Aiden Atlas' },
    { season: 'Season 1', date: '2025-01-14', keeper: 'Aiden Atlas' },
    { season: 'Season 1', date: '2025-01-21', keeper: 'James Lee' },
    { season: 'Season 1', date: '2025-02-04', keeper: 'Aiden Atlas' },
    { season: 'Season 1', date: '2025-02-11', keeper: 'Peter McNair' },
    { season: 'Season 1', date: '2025-02-18', keeper: 'Felix McIntosh' },
    { season: 'Season 1', date: '2025-02-25', keeper: 'Peter McNair' },
    { season: 'Season 1', date: '2025-03-04', keeper: 'Peter McNair' },
    { season: 'Season 1', date: '2025-03-11', keeper: 'Peter McNair' },
    { season: 'Season 1', date: '2025-03-18', keeper: 'Peter McNair' },
    { season: 'Season 1', date: '2025-03-25', keeper: 'Peter McNair' },
    { season: 'Season 2', date: '2025-04-29', keeper: 'Peter McNair' },
    { season: 'Season 2', date: '2025-05-06', keeper: 'Rory Pato' },
    { season: 'Season 2', date: '2025-05-13', keeper: 'Rory Pato' },
    { season: 'Season 2', date: '2025-05-20', keeper: 'Aiden Atlas' },
    { season: 'Season 2', date: '2025-05-27', keeper: 'Emre B' },
    { season: 'Season 2', date: '2025-06-03', keeper: 'Peter McNair' },
    { season: 'Season 2', date: '2025-06-10', keeper: 'Peter McNair' },
    { season: 'Season 2', date: '2025-06-17', keeper: 'Aiden Atlas' },
    { season: 'Season 2', date: '2025-06-24', keeper: 'Aiden Atlas' },
    { season: 'Season 2', date: '2025-07-01', keeper: 'Aiden Atlas' },
    { season: 'Season 2', date: '2025-07-08', keeper: 'Aiden Atlas' },
    { season: 'Season 2', date: '2025-07-15', keeper: 'Sam Tailby' },
    { season: 'Season 2', date: '2025-07-22', keeper: 'Sam Tailby' },
    { season: 'Season 2', date: '2025-07-29', keeper: 'Sam Tailby' },
    { season: 'Season 2', date: '2025-08-05', keeper: 'Sam Tailby' },
    { season: 'Season 2', date: '2025-08-12', keeper: 'Sam Tailby' },
    { season: 'Season 2', date: '2025-08-19', keeper: 'Sam Tailby' },
    { season: 'Season 2', date: '2025-08-26', keeper: 'Sam Tailby' },
    { season: 'Season 2', date: '2025-09-09', keeper: 'Sam Tailby' },
    { season: 'Season 2', date: '2025-09-16', keeper: 'Sam Tailby' },
    { season: 'Season 3', date: '2025-09-30', keeper: 'Sam Tailby' },
    { season: 'Season 3', date: '2025-10-07', keeper: 'Sam Tailby' },
    { season: 'Season 3', date: '2025-10-14', keeper: 'Sam Tailby' },
    { season: 'Season 3', date: '2025-10-21', keeper: 'Sam Tailby' },
    { season: 'Season 3', date: '2025-10-28', keeper: 'Sam Tailby' },
    { season: 'Season 3', date: '2025-11-11', keeper: 'Sam Tailby' },
    { season: 'Season 3', date: '2025-11-18', keeper: 'Sam Tailby' },
    { season: 'Season 3', date: '2025-11-25', keeper: 'Sam Tailby' },
    { season: 'Season 3', date: '2025-12-02', keeper: 'Sam Tailby' },
    { season: 'Season 3', date: '2025-12-09', keeper: 'Sam Tailby' },
    { season: 'Season 3', date: '2025-12-16', keeper: 'Sam Tailby' },
    { season: 'Season 3', date: '2025-01-13', keeper: 'Sam Tailby' },
    { season: 'Season 3', date: '2025-01-20', keeper: 'Cooper Bryant' },
    { season: 'Season 3', date: '2025-02-03', keeper: 'Sam Tailby' },
    { season: 'Season 3', date: '2025-02-10', keeper: 'Sam Tailby' },
    { season: 'Season 3', date: '2025-02-17', keeper: 'Sam Tailby' },
    { season: 'Season 4', date: '2026-02-24', keeper: 'Sam Tailby' },
    { season: 'Season 4', date: '2026-03-03', keeper: 'Sam Tailby' },
    { season: 'Season 4', date: '2026-03-10', keeper: 'Sam Tailby' },
    { season: 'Season 4', date: '2026-03-17', keeper: 'Sam Tailby' },
    { season: 'Season 4', date: '2026-03-24', keeper: 'Sam Tailby' },
    { season: 'Season 4', date: '2026-03-31', keeper: 'Sam Tailby' },
    { season: 'Season 4', date: '2026-04-07', keeper: 'Sam Tailby' },
    { season: 'Season 4', date: '2026-04-14', keeper: 'Sam Tailby' },
    { season: 'Season 4', date: '2026-04-21', keeper: 'Sam Tailby' },
    { season: 'Season 4', date: '2026-04-28', keeper: 'Sam Tailby' },
    { season: 'Season 4', date: '2026-05-05', keeper: 'Sam Tailby' },
    { season: 'Season 4', date: '2026-05-12', keeper: 'Sam Tailby' },
    { season: 'Season 4', date: '2026-05-19', keeper: 'Sam Tailby' },
    { season: 'Season 4', date: '2026-05-26', keeper: 'Sam Tailby' },
    { season: 'Season 4', date: '2026-06-02', keeper: 'Sam Tailby' },
    { season: 'Season 5', date: '2026-06-16', keeper: 'Sam Tailby' },
    { season: 'Season 5', date: '2026-06-23', keeper: 'Sam Tailby' },
    { season: 'Season 5', date: '2026-06-30', keeper: 'Aaron Swann' },
    { season: 'Season 5', date: '2026-07-07', keeper: 'Aaron Swann' },
    { season: 'Season 5', date: '2026-07-14', keeper: 'Aaron Swann' },
    { season: 'Season 5', date: '2026-07-21', keeper: 'Aaron Swann' },
    { season: 'Season 5', date: '2026-07-28', keeper: 'Peter McNair' },
    { season: 'Season 5', date: '2026-08-04', keeper: 'Peter McNair' },
    { season: 'Season 5', date: '2026-08-11', keeper: 'Peter McNair' },
    { season: 'Season 5', date: '2026-08-18', keeper: 'Peter McNair' },
    { season: 'Season 5', date: '2026-08-25', keeper: 'Peter McNair' },
    { season: 'Season 5', date: '2026-09-01', keeper: 'Peter McNair' },
    { season: 'Season 5', date: '2026-09-08', keeper: 'Peter McNair' },
    { season: 'Season 5', date: '2026-09-15', keeper: 'Peter McNair' },
    { season: 'Season 6', date: '2026-09-29', keeper: 'Peter McNair' }
];

function normalizeSeason(s?: string): string {
    if (!s) return '';
    return s.toLowerCase().replace(/[^0-9]/g, '');
}

function normalizeDate(d?: string): string {
    if (!d) return '';
    return d.split('T')[0].trim();
}

/**
 * Finds the matching historical goalkeeper player ID for a game.
 */
export function findHistoricalKeeperId(
    gameSeason: string,
    gameDate: string,
    players: { id: string; name: string }[]
): string | undefined {
    const normSeason = normalizeSeason(gameSeason);
    const normDate = normalizeDate(gameDate);

    // 1. Try exact match on season and date
    let entry = HISTORICAL_GOALKEEPERS.find(h =>
        normalizeSeason(h.season) === normSeason && h.date === normDate
    );

    // 2. If season 3 and date has year 2025/2026 rollover mismatch, check alternate year
    if (!entry && normSeason === '3') {
        const altDate = normDate.startsWith('2025-01') ? normDate.replace('2025-01', '2026-01')
            : normDate.startsWith('2025-02') ? normDate.replace('2025-02', '2026-02')
            : normDate.startsWith('2026-01') ? normDate.replace('2026-01', '2025-01')
            : normDate.startsWith('2026-02') ? normDate.replace('2026-02', '2025-02')
            : null;
        if (altDate) {
            entry = HISTORICAL_GOALKEEPERS.find(h =>
                normalizeSeason(h.season) === normSeason && (h.date === altDate || h.date === normDate)
            );
        }
    }

    // 3. Fallback: match by date alone
    if (!entry) {
        entry = HISTORICAL_GOALKEEPERS.find(h => h.date === normDate);
    }

    // 4. Fallback: match by season and month-day (MM-DD)
    if (!entry && normDate.length >= 10) {
        const monthDay = normDate.slice(5);
        entry = HISTORICAL_GOALKEEPERS.find(h =>
            normalizeSeason(h.season) === normSeason && h.date.endsWith(monthDay)
        );
    }

    if (!entry) return undefined;

    // Find player by name
    const keeperName = entry.keeper.trim().toLowerCase();
    const player = players.find(p => p.name.trim().toLowerCase() === keeperName)
        || players.find(p => p.name.trim().toLowerCase().startsWith(keeperName) || keeperName.startsWith(p.name.trim().toLowerCase()));

    return player?.id;
}
