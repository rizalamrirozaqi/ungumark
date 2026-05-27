import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db/client'; 
import { user } from '$lib/server/db/auth-schema'; 
import { and, eq, lt } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return json({ error: 'Tidak Terverifikasi, Akses ditolak!!' }, { status: 401 });
    }

    try {
        const kemarin = new Date();
        kemarin.setHours(kemarin.getHours() - 24);

        const hasil = await db.delete(user).where(
            and(
                eq(user.emailVerified, false),
                lt(user.createdAt, kemarin)
            )
        );

        console.log('Sapuman beraksi! Akun zombie telah berhasil dihapus.');
        
        return json({ 
            success: true, 
            message: 'Database berhasil dibersihkan dari akun zombie!' 
        });
    } catch (error) {
        console.error('Gagal membersihkan database:', error);
        return json({ error: 'Gagal mengeksekusi pembersihan' }, { status: 500 });
    }
}