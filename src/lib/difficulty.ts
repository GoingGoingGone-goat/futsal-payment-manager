import type { Game } from './storage';

export type ConfidenceLevel = 'Low' | 'Medium' | 'High' | 'Very High' | 'Excellent';
export type MatchResultType = 'W' | 'D' | 'L';

export interface OpponentDifficultyStats {
    name: string;
    gamesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsScored: number;
    goalsConceded: number;
    goalDifference: number;
    gdPerGame: number;
    resultRate: number;
    resultsDifficulty: number;
    gdDifficulty: number;
    basicDifficulty: number;
    confidenceWeight: number;
    confidenceLabel: ConfidenceLevel;
    finalDifficulty: number; // 0 to 1 unrounded
    difficultyScore: number; // 0.0 to 10.0 unrounded
    displayDifficulty: number; // rounded to 1 decimal place
    difficultyCategory: 'Very Easy' | 'Favourable' | 'Even' | 'Difficult' | 'Very Difficult';
    recentForm: MatchResultType[]; // up to 5 matches: oldest -> newest (newest on right)
    lastPlayed: string;
    rank: number; // 1-based ladder position
    totalOpponents: number;
}

/**
 * Returns confidence weight and label based on number of games played.
 * 1 game: 0.50, Low
 * 2 games: 0.75, Medium
 * 3 games: 0.90, High
 * 4 games: 0.93, Very High
 * 5 games: 0.95, Very High
 * 6-8 games: 0.96-0.97, Excellent
 * 9+ games: 0.98, Excellent
 */
export function getConfidence(gamesPlayed: number): { weight: number; label: ConfidenceLevel } {
    if (gamesPlayed <= 1) return { weight: 0.50, label: 'Low' };
    if (gamesPlayed === 2) return { weight: 0.75, label: 'Medium' };
    if (gamesPlayed === 3) return { weight: 0.90, label: 'High' };
    if (gamesPlayed === 4) return { weight: 0.93, label: 'Very High' };
    if (gamesPlayed === 5) return { weight: 0.95, label: 'Very High' };
    if (gamesPlayed === 6) return { weight: 0.96, label: 'Excellent' };
    if (gamesPlayed === 7) return { weight: 0.965, label: 'Excellent' };
    if (gamesPlayed === 8) return { weight: 0.97, label: 'Excellent' };
    return { weight: 0.98, label: 'Excellent' };
}

/**
 * Categorizes a 0.0 - 10.0 difficulty score:
 * 0.0 - 2.0 = Very Easy
 * 2.0 - 4.0 = Favourable
 * 4.0 - 6.0 = Even
 * 6.0 - 8.0 = Difficult
 * 8.0 - 10.0 = Very Difficult
 */
export function getDifficultyCategory(score: number): {
    label: 'Very Easy' | 'Favourable' | 'Even' | 'Difficult' | 'Very Difficult';
    colorClass: string;
    bgClass: string;
    borderClass: string;
} {
    if (score < 2.0) {
        return { label: 'Very Easy', colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10', borderClass: 'border-emerald-500/30' };
    }
    if (score < 4.0) {
        return { label: 'Favourable', colorClass: 'text-green-400', bgClass: 'bg-green-500/10', borderClass: 'border-green-500/30' };
    }
    if (score <= 6.0) {
        return { label: 'Even', colorClass: 'text-amber-400', bgClass: 'bg-amber-500/10', borderClass: 'border-amber-500/30' };
    }
    if (score <= 8.0) {
        return { label: 'Difficult', colorClass: 'text-orange-400', bgClass: 'bg-orange-500/10', borderClass: 'border-orange-500/30' };
    }
    return { label: 'Very Difficult', colorClass: 'text-red-400', bgClass: 'bg-red-500/10', borderClass: 'border-red-500/30' };
}

/**
 * Returns styling for confidence levels:
 * Excellent = greener (emerald)
 * Very High = green
 * High = amber/orange middle
 * Medium = orange
 * Low = redder (red)
 */
export function getConfidenceStyle(label: ConfidenceLevel): {
    colorClass: string;
    bgClass: string;
    borderClass: string;
} {
    switch (label) {
        case 'Excellent':
            return { colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10', borderClass: 'border-emerald-500/30' };
        case 'Very High':
            return { colorClass: 'text-green-400', bgClass: 'bg-green-500/10', borderClass: 'border-green-500/30' };
        case 'High':
            return { colorClass: 'text-lime-400', bgClass: 'bg-lime-500/10', borderClass: 'border-lime-500/30' };
        case 'Medium':
            return { colorClass: 'text-amber-400', bgClass: 'bg-amber-500/10', borderClass: 'border-amber-500/30' };
        case 'Low':
        default:
            return { colorClass: 'text-red-400', bgClass: 'bg-red-500/10', borderClass: 'border-red-500/30' };
    }
}

/**
 * Parses match score "Us - Them" (e.g. "5-3" or "5 : 3")
 */
export function parseScore(score: string): { us: number; them: number; isValid: boolean } {
    if (!score) return { us: 0, them: 0, isValid: false };
    const parts = score.split(/[-:]/).map(s => parseInt(s.trim(), 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { us: parts[0], them: parts[1], isValid: true };
    }
    return { us: 0, them: 0, isValid: false };
}

/**
 * Calculates raw difficulty metrics for an opponent
 */
export function calculateOpponentMetrics(
    name: string,
    games: Game[]
): Omit<OpponentDifficultyStats, 'rank' | 'totalOpponents'> {
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;
    let lastPlayed = '';

    // Sort chronologically (oldest to newest) to extract recent form cleanly
    const sortedChronological = [...games].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const formList: MatchResultType[] = [];

    sortedChronological.forEach(g => {
        if (!lastPlayed || new Date(g.date).getTime() > new Date(lastPlayed).getTime()) {
            lastPlayed = g.date;
        }

        const { us, them, isValid } = parseScore(g.score);
        if (isValid) {
            goalsScored += us;
            goalsConceded += them;

            if (us > them) {
                wins++;
                formList.push('W');
            } else if (us < them) {
                losses++;
                formList.push('L');
            } else {
                draws++;
                formList.push('D');
            }
        }
    });

    const gamesPlayed = games.length;
    const goalDifference = goalsScored - goalsConceded;

    if (gamesPlayed === 0) {
        return {
            name,
            gamesPlayed: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsScored: 0,
            goalsConceded: 0,
            goalDifference: 0,
            gdPerGame: 0,
            resultRate: 0.5,
            resultsDifficulty: 0.5,
            gdDifficulty: 0.5,
            basicDifficulty: 0.5,
            confidenceWeight: 0.5,
            confidenceLabel: 'Low',
            finalDifficulty: 0.5,
            difficultyScore: 5.0,
            displayDifficulty: 5.0,
            difficultyCategory: 'Even',
            recentForm: [],
            lastPlayed: ''
        };
    }

    // 1. Results Component (70%)
    const resultRate = (wins + 0.5 * draws) / gamesPlayed;
    const resultsDifficulty = 1 - resultRate;

    // 2. Goal Difference Component (30%)
    const gdPerGame = goalDifference / gamesPlayed;
    // (5 - GD per game) / 10 clamped between 0 and 1
    const gdDifficulty = Math.max(0, Math.min(1, (5 - gdPerGame) / 10));

    // 3. Basic Difficulty (0 to 1)
    const basicDifficulty = 0.70 * resultsDifficulty + 0.30 * gdDifficulty;

    // 4. Sample-Size Adjustment
    const { weight: confidenceWeight, label: confidenceLabel } = getConfidence(gamesPlayed);
    const finalDifficulty = confidenceWeight * basicDifficulty + (1 - confidenceWeight) * 0.5;

    // 5. Final H2H Difficulty Score (0.0 to 10.0)
    const difficultyScore = finalDifficulty * 10;
    const displayDifficulty = Math.round(difficultyScore * 10) / 10;
    const categoryInfo = getDifficultyCategory(displayDifficulty);

    // Recent form: up to last 5 matches, newest -> oldest (reading left to right)
    const recentForm = [...formList].reverse().slice(0, 5);

    return {
        name,
        gamesPlayed,
        wins,
        draws,
        losses,
        goalsScored,
        goalsConceded,
        goalDifference,
        gdPerGame,
        resultRate,
        resultsDifficulty,
        gdDifficulty,
        basicDifficulty,
        confidenceWeight,
        confidenceLabel,
        finalDifficulty,
        difficultyScore,
        displayDifficulty,
        difficultyCategory: categoryInfo.label,
        recentForm,
        lastPlayed
    };
}

/**
 * Calculates the complete Opponent Difficulty Ladder from match history.
 * Ranked #1 = Hardest opponent historically.
 */
export function getOpponentLadder(
    allGames: Game[],
    seasonFilter?: string
): OpponentDifficultyStats[] {
    const relevantGames = (seasonFilter && seasonFilter !== 'All' && seasonFilter !== 'All Time')
        ? allGames.filter(g => g.season === seasonFilter)
        : allGames;

    // Group games by opponent (case-insensitive key, keep first canonical name)
    const opponentGroups = new Map<string, { displayName: string; games: Game[] }>();

    relevantGames.forEach(game => {
        const rawName = (game.opponent || '').trim();
        if (!rawName) return;

        const key = rawName.toLowerCase();
        const existing = opponentGroups.get(key);
        if (existing) {
            existing.games.push(game);
        } else {
            opponentGroups.set(key, { displayName: rawName, games: [game] });
        }
    });

    const metricsList = Array.from(opponentGroups.values()).map(group =>
        calculateOpponentMetrics(group.displayName, group.games)
    );

    // Sort ladder: Hardest (#1) -> Easiest
    // Primary: difficultyScore DESC (unrounded to avoid artificial ties)
    // Secondary: gamesPlayed DESC
    // Tertiary: gdPerGame ASC (worse GD = harder)
    // Quaternary: name ASC
    metricsList.sort((a, b) => {
        if (Math.abs(b.difficultyScore - a.difficultyScore) > 1e-6) {
            return b.difficultyScore - a.difficultyScore;
        }
        if (b.gamesPlayed !== a.gamesPlayed) {
            return b.gamesPlayed - a.gamesPlayed;
        }
        if (Math.abs(a.gdPerGame - b.gdPerGame) > 1e-6) {
            return a.gdPerGame - b.gdPerGame;
        }
        return a.name.localeCompare(b.name);
    });

    const totalOpponents = metricsList.length;

    return metricsList.map((m, index) => ({
        ...m,
        rank: index + 1,
        totalOpponents
    }));
}

/**
 * Gets head-to-head details for a single opponent using the shared ladder calculation
 */
export function getOpponentDetails(
    allGames: Game[],
    opponentName: string,
    seasonFilter?: string
): OpponentDifficultyStats | null {
    const ladder = getOpponentLadder(allGames, seasonFilter);
    const targetKey = opponentName.trim().toLowerCase();
    const found = ladder.find(opp => opp.name.toLowerCase() === targetKey);
    return found || null;
}

/**
 * Returns ordinal string for ladder positions (e.g. 1st, 2nd, 3rd, 4th, 11th)
 */
export function getOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
