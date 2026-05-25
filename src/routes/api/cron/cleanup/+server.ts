import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db/client'; // Sesuaikan path db kamu
import { user } from '$lib/server/db/auth-schema'; // Sesuaikan path schema user kamu
import { and, eq, lt } from 'drizzle-orm';

export async function GET({ request }) {
    // 1. Gembok Keamanan: Biar gak sembarang orang bisa manggil API ini
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return json({ error: 'Hayo mau ngapain? Akses ditolak!' }, { status: 401 });
    }

    try {
        // 2. Hitung waktu mundur (24 jam yang lalu)
        const kemarin = new Date();
        kemarin.setHours(kemarin.getHours() - 24);

        // 3. Perintah Eksekusi Drizzle buat nyapu database
        // Hapus SEMUA user yang emailVerified = false (0) DAN createdAt lebih kecil dari 24 jam lalu
        const hasil = await db.delete(user).where(
            and(
                eq(user.emailVerified, false),
                lt(user.createdAt, kemarin)
            )
        );

        console.log('Sapuman beraksi! Akun zombie berhasil dihapus.');
        
        return json({ 
            success: true, 
            message: 'Database berhasil dibersihkan dari akun zombie!' 
        });
    } catch (error) {
        console.error('Gagal membersihkan database:', error);
        return json({ error: 'Gagal mengeksekusi pembersihan' }, { status: 500 });
    }
}