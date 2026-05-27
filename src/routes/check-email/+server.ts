import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/client';
import { user, account } from '$lib/server/db/auth-schema';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
    try {
        const { email } = await request.json();
        
        // 1. Cari email di tabel user
        const existingUsers = await db.select().from(user).where(eq(user.email, email));
        
        if (existingUsers.length === 0) {
            return json({ exists: false }); // Bebas hambatan, user belum ada
        }
        
        const existingUser = existingUsers[0];

        // 2. Cek tabel account buat nyari dia daftar pakai Google atau Password biasa
        const userAccounts = await db.select().from(account).where(eq(account.userId, existingUser.id));
        
        let provider = 'email';
        if (userAccounts.length > 0) {
            provider = userAccounts[0].providerId; // Bakal berisi 'google' atau 'credential'
        }

        return json({ exists: true, provider });
    } catch (error) {
        console.error("Gagal cek email:", error);
        return json({ error: 'Gagal ngecek email' }, { status: 500 });
    }
}