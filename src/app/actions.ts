'use server';

import { addGame, addPayment, addPlayer, addFee, getData, deletePlayer, deleteGame, deletePayment, deleteFee, updatePlayer, updateGame } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    const password = formData.get('password') as string;

    // Simple environment variable check
    if (password === process.env.ADMIN_PASSWORD) {
        // Set secure cookie
        const cookieStore = await cookies(); // await is important in Next.js 15
        cookieStore.set('auth_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });
        redirect('/');
    }

    // If failed, redirect back to login with error param (could be handled better but keeping it simple)
    redirect('/login?error=true');
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('auth_session');
    redirect('/login');
}

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
    redirect('/players?msg=player_deleted');
}

export async function deleteGameAction(id: string) {
    await deleteGame(id);
    revalidatePath('/');
    revalidatePath('/games');
    redirect('/games?msg=game_deleted');
}

export async function deletePaymentAction(id: string) {
    await deletePayment(id);
    revalidatePath('/');
    revalidatePath('/payments');
    revalidatePath('/players');
    redirect('/payments?msg=payment_deleted');
}

export async function createFee(formData: FormData) {
    const playerId = formData.get('playerId') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;
    const date = new Date().toISOString();
    const season = (formData.get('season') as string) || 'Season 3';

    await addFee({ playerId, amount, description, date, season });
    revalidatePath('/fees');
    revalidatePath('/players');
    revalidatePath(`/players/${playerId}`);
}

export async function deleteFeeAction(id: string) {
    await deleteFee(id);
    revalidatePath('/fees');
    revalidatePath('/players');
    redirect('/fees?msg=fee_deleted');
}

// --- Update Actions ---

export async function editPlayer(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;

    if (!id || !name) return;

    await updatePlayer(id, name);
    revalidatePath(`/players/${id}`);
    revalidatePath('/players');
}

export async function editGame(formData: FormData) {
    const id = formData.get('id') as string;
    const date = formData.get('date') as string;
    const opponent = formData.get('opponent') as string;
    const scoreMy = formData.get('scoreMy') as string;
    const scoreTheir = formData.get('scoreTheir') as string;
    const season = formData.get('season') as string;

    if (!id || !date || !opponent) return;

    const score = `${scoreMy}-${scoreTheir}`;

    await updateGame(id, {
        date,
        opponent,
        score,
        season
    });

    revalidatePath('/games');
    revalidatePath(`/games/${id}`);
    redirect('/games?msg=updated');
}
