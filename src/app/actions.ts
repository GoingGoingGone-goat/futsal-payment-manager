'use server';

import { addGame, addPayment, addPlayer, getData } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export async function createPlayer(formData: FormData) {
    const name = formData.get('name') as string;
    await addPlayer(name);
    revalidatePath('/');
    revalidatePath('/players');
}

export async function createPayment(formData: FormData) {
    const playerId = formData.get('playerId') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const date = formData.get('date') as string;

    await addPayment({ playerId, amount, date });
    revalidatePath('/');
    revalidatePath('/payments');
}

export async function createGame(formData: FormData) {
    const opponent = formData.get('opponent') as string;
    const date = formData.get('date') as string;
    const score = formData.get('score') as string;
    const cost = parseFloat(formData.get('cost') as string); // Total cost of game? Or per player? 
    // Requirement: "Add in a game... cost per player" usually calculated?
    // User prompt said "Print out how much everyone owes". Usually a game costs $X and is split by N players.
    // Or "Cost per player" is fixed.
    // Let's assume input is "Cost Per Player" for simplicity as per my plan.

    const playerIds = formData.getAll('players') as string[];

    await addGame({
        opponent,
        date,
        score,
        costPerPlayer: cost,
        playerIds
    });

    revalidatePath('/');
    revalidatePath('/games');
}
