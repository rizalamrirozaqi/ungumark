import { load } from 'cheerio';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';

import { db } from '$lib/server/db/client';
import { metadata, urls, groups } from '$lib/server/db/schema';
import { auth } from '../auth';

function pickFirst(...values: Array<string | undefined | null>) {
    for (const v of values) {
        if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return null;
}

function parseUrl(value: unknown) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
        const u = new URL(trimmed);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
        return u.toString();
    } catch {
        return null;
    }
}

function toAbsoluteUrl(baseUrl: string, maybeUrl: string | null) {
    if (!maybeUrl) return null;
    const trimmed = maybeUrl.trim();
    if (!trimmed) return null;
    try {
        return new URL(trimmed, baseUrl).toString();
    } catch {
        return trimmed;
    }
}

async function fetchHtml(targetUrl: string) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 6000);
    try {
        const res = await fetch(targetUrl, {
            signal: controller.signal,
            redirect: 'follow',
            headers: {
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
                accept: 'text/html,application/xhtml+xml',
                'accept-language': 'en-US,en;q=0.9,id;q=0.8'
            }
        });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
        const ct = res.headers.get('content-type') ?? '';
        if (!ct.includes('text/html')) throw new Error(`Unsupported content-type: ${ct}`);
        return await res.text();
    } finally {
        clearTimeout(t);
    }
}

// ==========================================
// FUNGSI BARU: SMART METADATA FETCHER
// ==========================================
async function fetchSmartMetadata(targetUrl: string) {
    try {
        const u = new URL(targetUrl);
        const hostname = u.hostname;

        // 1. JALUR YOUTUBE & YT MUSIC
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
            let videoUrl = targetUrl;
            if (hostname === 'music.youtube.com') {
                videoUrl = targetUrl.replace('music.youtube.com', 'www.youtube.com');
            }
            try {
                const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`);
                if (res.ok) {
                    const data = await res.json();
                    return {
                        title: data.title,
                        description: `Channel: ${data.author_name}`,
                        image: data.thumbnail_url
                    };
                }
            } catch (e) {
                console.error('YT oEmbed failed:', e);
            }
        }

        // 2. JALUR SOSMED (IG, TikTok, X) VIA MICROLINK
        if (hostname.includes('instagram.com') || hostname.includes('tiktok.com') || hostname.includes('x.com') || hostname.includes('twitter.com')) {
            try {
                const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}`);
                if (res.ok) {
                    const json = await res.json();
                    const data = json.data;
                    return {
                        title: data.title || data.author || 'Postingan Sosial Media',
                        description: data.description || null,
                        image: data.image?.url || data.logo?.url || null
                    };
                }
            } catch (e) {
                console.error('Microlink failed:', e);
            }
        }

        // 3. JALUR WEBSITE BIASA (FALLBACK KE CHEERIO)
        const html = await fetchHtml(targetUrl);
        const $ = load(html);
        const title = pickFirst($('meta[property="og:title"]').attr('content'), $('meta[name="twitter:title"]').attr('content'), $('title').first().text());
        const description = pickFirst($('meta[property="og:description"]').attr('content'), $('meta[name="description"]').attr('content'), $('meta[name="twitter:description"]').attr('content'));
        const image = pickFirst($('meta[property="og:image"]').attr('content'), $('meta[name="twitter:image"]').attr('content'));
        const imageAbs = toAbsoluteUrl(targetUrl, image);

        return { title, description, image: imageAbs };

    } catch (e) {
        console.error('Semua fetch gagal:', e);
        return { title: null, description: null, image: null };
    }
}

export const api = new Hono().basePath('/api');

// ==========================================
// 1. ENDPOINT METADATA (URLS)
// ==========================================
api.post('/metadata', async (c) => {
    // WAJIB: Cek sesi user
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);
    const userId = session.user.id;

    let body: Record<string, any>;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: 'Invalid JSON body. Expected: { url }' }, 400);
    }

    const targetUrl = parseUrl((body as { url?: unknown } | null)?.url);
    if (!targetUrl) return c.json({ error: 'Invalid url' }, 400);

    const categoryName = body.category || null;
    let targetGroupId = null;

    // Cari ID grup berdasarkan Nama Grup dan Milik User ini
    if (categoryName) {
        const g = await db.select()
            .from(groups)
            .where(and(eq(groups.name, categoryName), eq(groups.userId, userId)))
            .limit(1);
        if (g[0]) targetGroupId = g[0].id;
    }

    // Eksekusi fungsi pintar yang sudah digabung
    const metaData = await fetchSmartMetadata(targetUrl);
    const title = metaData.title;
    const description = metaData.description;
    const imageAbs = metaData.image;
    const now = Date.now();

    // Insert/Update URL (Filter berdasarkan userId)
    let row = await db.select().from(urls).where(and(eq(urls.url, targetUrl), eq(urls.userId, userId))).limit(1);
    let urlRow = row[0];
    
    if (!urlRow) {
        const inserted = await db.insert(urls).values({ 
            url: targetUrl, 
            groupId: targetGroupId, 
            userId: userId, // <-- Tancapkan KTP Pemilik
            updatedAt: new Date(now) 
        }).returning();
        urlRow = inserted[0];
    } else {
        const updated = await db.update(urls).set({ 
            groupId: targetGroupId !== null ? targetGroupId : urlRow.groupId,
            updatedAt: new Date(now) 
        }).where(eq(urls.id, urlRow.id)).returning();
        urlRow = updated[0];
    }

    const metaExisting = await db.select().from(metadata).where(eq(metadata.urlId, urlRow.id)).limit(1);
    if (metaExisting[0]) {
        await db.update(metadata).set({ title, description, image: imageAbs, fetchedAt: new Date(now) }).where(eq(metadata.urlId, urlRow.id));
    } else {
        await db.insert(metadata).values({ urlId: urlRow.id, title, description, image: imageAbs, fetchedAt: new Date(now) });
    }

    const metaRow = (await db.select().from(metadata).where(eq(metadata.urlId, urlRow.id)).limit(1))[0] ?? null;

    // Untuk response frontend, kita kembalikan category (nama grup)
    return c.json({
        id: urlRow.id,
        url: urlRow.url,
        category: categoryName,
        metadata: metaRow ? { title: metaRow.title, description: metaRow.description, image: metaRow.image, fetchedAt: metaRow.fetchedAt } : null
    });
});

api.patch('/metadata/:id', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

    const urlId = c.req.param('id');
    const { title, description } = await c.req.json();

    // WAJIB: Pastikan URL ini benar-benar milik user yang sedang login
    const urlCheck = await db.select().from(urls).where(and(eq(urls.id, urlId), eq(urls.userId, session.user.id))).limit(1);
    if (!urlCheck[0]) return c.json({ error: 'Forbidden' }, 403);

    try {
        await db.update(metadata)
            .set({ 
                title: title || null, 
                description: description || null, 
                fetchedAt: new Date() 
            })
            .where(eq(metadata.urlId, urlId));
            
        return c.json({ success: true });
    } catch (err) {
        return c.json({ error: 'Gagal mengupdate metadata' }, 500);
    }
});

api.delete('/metadata', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

    try {
        const body = await c.req.json();
        if (!body.id) return c.json({ error: 'ID is required' }, 400);

        // Pastikan URL yang mau dihapus memang milik user yang lagi login!
        const urlToDel = await db.select().from(urls).where(and(eq(urls.id, body.id), eq(urls.userId, session.user.id))).limit(1);
        if (!urlToDel[0]) return c.json({ error: 'Forbidden' }, 403);

        await db.delete(metadata).where(eq(metadata.urlId, body.id));
        await db.delete(urls).where(eq(urls.id, body.id));

        return c.json({ success: true });
    } catch (err) {
        return c.json({ error: 'Gagal menghapus data' }, 500);
    }
});

// ==========================================
// 2. ENDPOINT GROUPS
// ==========================================
api.get('/groups', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);
    
    // FILTER HANYA MILIK USER INI
    const userGroups = await db.select().from(groups).where(eq(groups.userId, session.user.id));
    return c.json(userGroups);
});

api.post('/groups', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

    const { name } = await c.req.json();
    try {
        await db.insert(groups).values({ 
            name, 
            userId: session.user.id 
        });
        return c.json({ success: true });
    } catch (e) {
        return c.json({ error: 'Gagal membuat grup' }, 400);
    }
});

api.delete('/groups', async(c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

    const { name } = await c.req.json();

    // Hapus grup yg namanya cocok DAN milik user ini
    await db.delete(groups).where(and(eq(groups.name, name), eq(groups.userId, session.user.id)));
    return c.json({ success: true });
});

api.patch('/groups/:name', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

    const oldName = c.req.param('name');
    const { name: newName } = await c.req.json();

    if (!newName || newName.trim() === '') return c.json({ error: 'Nama tidak boleh kosong' }, 400);

    try {
        const updated = await db.update(groups)
            .set({ name: newName })
            .where(and(eq(groups.name, oldName), eq(groups.userId, session.user.id)))
            .returning();
            
        return c.json({ success: true, group: updated[0] });
    } catch (err) {
        return c.json({ error: 'Gagal mengupdate grup' }, 500);
    }
});

// Endpoint mindahin grup: Frontend mengirimkan nama grup (groupId di body), kita cari ID-nya dulu
api.patch('/urls/:id/group', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

    const urlId = c.req.param('id');
    const { groupId: newGroupName } = await c.req.json(); // dr frontend ini berupa nama grup

    let targetGroupId = null;
    if (newGroupName) {
        const g = await db.select().from(groups).where(and(eq(groups.name, newGroupName), eq(groups.userId, session.user.id))).limit(1);
        if (g[0]) targetGroupId = g[0].id;
    }

    try {
        const updated = await db.update(urls)
            .set({ groupId: targetGroupId, updatedAt: new Date() })
            .where(and(eq(urls.id, urlId), eq(urls.userId, session.user.id)))
            .returning();

        if (updated.length === 0) return c.json({ error: 'URL tidak ditemukan atau bukan milik Anda' }, 404);
        return c.json({ success: true, url: updated[0] });
    } catch (err) {
        return c.json({ error: 'Gagal mengupdate grup URL' }, 500);
    }
});