
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
    if (!process.env.POSTGRES_URL) {
        return NextResponse.json({ error: 'Not running on Vercel Postgres' }, { status: 500 });
    }

    try {
        await sql`
      CREATE TABLE IF NOT EXISTS players (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `;

        await sql`
      CREATE TABLE IF NOT EXISTS games (
        id UUID PRIMARY KEY,
        date VARCHAR(255) NOT NULL,
        opponent VARCHAR(255) NOT NULL,
        score VARCHAR(50),
        cost_per_player DECIMAL(10, 2) NOT NULL
      );
    `;

        await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY,
        player_id UUID REFERENCES players(id),
        amount DECIMAL(10, 2) NOT NULL,
        date VARCHAR(255) NOT NULL
      );
    `;

        await sql`
      CREATE TABLE IF NOT EXISTS game_players (
        game_id UUID REFERENCES games(id),
        player_id UUID REFERENCES players(id),
        PRIMARY KEY (game_id, player_id)
      );
    `;

        return NextResponse.json({ message: 'Database seeded successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
