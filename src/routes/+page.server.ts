import { redirect } from '@sveltejs/kit';
import { and, desc, eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

import { db } from '$lib/server/db/client';
import { metadata, urls, groups } from '$lib/server/db/schema'; // Pastikan groups di-import

export const load: PageServerLoad = async ({ url, locals }) => {
    // 1. Validasi login
    if (!locals.user) redirect(302, '/sign-in');
    
    // Ambil ID user yang sedang aktif
    const userId = locals.user.id;

    const q = url.searchParams.get('q')?.trim() ?? '';
    const qLower = q.toLowerCase();
    const pattern = `%${qLower.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`;

    // 2. Siapkan filter pencarian teks
    const searchCondition =
        qLower.length > 0
            ? sql`(
                    lower(${urls.url}) like ${pattern} escape '\\'
                    or lower(coalesce(${metadata.title}, '')) like ${pattern} escape '\\'
                    or lower(coalesce(${metadata.description}, '')) like ${pattern} escape '\\'
                )`
            : undefined;

    // 3. Gabungkan filter kepemilikan akun DENGAN filter pencarian (jika ada)
    const userCondition = eq(urls.userId, userId);
    const finalCondition = searchCondition ? and(userCondition, searchCondition) : userCondition;

    // 4. Tarik data dari Database
    const rows = await db
        .select({
            id: urls.id,
            url: urls.url,
            category: groups.name, // Tarik nama grup untuk dipakai di frontend
            title: metadata.title,
            description: metadata.description,
            image: metadata.image,
            fetchedAt: metadata.fetchedAt
        })
        .from(urls)
        .leftJoin(metadata, eq(metadata.urlId, urls.id))
        .leftJoin(groups, eq(urls.groupId, groups.id)) // Relasikan dengan tabel grup
        .where(finalCondition)
        .orderBy(desc(urls.createdAt))
        .limit(36);

    return {
        q,
        items: rows.map((r) => ({
            id: r.id,
            url: r.url,
            category: r.category, // Kirim ke frontend
            metadata: r.title || r.description || r.image || r.fetchedAt
                ? { title: r.title, description: r.description, image: r.image, fetchedAt: r.fetchedAt }
                : null
        }))
    };
};