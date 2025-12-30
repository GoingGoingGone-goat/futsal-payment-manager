'use server';

import { addGame, addPayment, addPlayer, getData, deletePlayer, deleteGame, deletePayment } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export async function createPlayer(formData: FormData) {
    const name = formData.get('name') as string;
    await addPlayer(name);
    revalidatePath('/');
    revalidatePath('/players');
    revalidatePath('/games');
    revalidatePath('/payments');
}

export async function createPayment(formData: FormData) {
    const playerId = formData.get('playerId') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const date = formData.get('date') as string;
    const season = (formData.get('season') as string) || 'Season 3';

    await addPayment({ playerId, amount, date, season });
    revalidatePath('/');
    revalidatePath('/payments');
}

export async function createGame(formData: FormData) {
    const opponent = formData.get('opponent') as string;
    const date = formData.get('date') as string;
    const score = formData.get('score') as string;
    const season = (formData.get('season') as string) || 'Season 3';

    // Cost logic: Defaults to 99, can be overridden if input exists and is valid
    // If user provides "totalCost", we divide by player count.
    const totalCostInput = formData.get('totalCost');
    const totalCost = totalCostInput ? parseFloat(totalCostInput as string) : 99.00;

    // Get all players that were checked
    const playerIds = formData.getAll('players') as string[];

    if (playerIds.length === 0) {
        return; // Validation should happen closely to UI, but good safety
    }

    const costPerPlayer = totalCost / playerIds.length;

    const players = playerIds.map(pid => {
        const goalsInput = formData.get(`goals-${pid}`);
        return {
            playerId: pid,
            goals: goalsInput ? parseInt(goalsInput as string) : 0
        };
    });

    await addGame({
        opponent,
        date,
        score,
        costPerPlayer,
        players,
        season
    });

    revalidatePath('/');
    revalidatePath('/games');
    revalidatePath(`/teams/${opponent}`); // Revalidate the opponent history page if it exists
}

export async function deletePlayerAction(id: string) {
    await deletePlayer(id);
    revalidatePath('/');
    revalidatePath('/players');
    revalidatePath('/games');
}

export async function deleteGameAction(id: string) {
    await deleteGame(id);
    revalidatePath('/');
    revalidatePath('/games');
}

export async function deletePaymentAction(id: string) {
    await deletePayment(id);
    revalidatePath('/');
    revalidatePath('/payments');
    revalidatePath('/players');
}
