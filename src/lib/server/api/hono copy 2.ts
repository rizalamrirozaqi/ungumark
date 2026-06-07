import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { db } from '$lib/server/db/client';
import { metadata, urls, groups, urlTags, tags } from '$lib/server/db/schema';
import { auth } from '../auth';
import { fetchUrlMetadata } from '../scraper';
import { env } from '$env/dynamic/private';

// ==========================================
// 🔥 FUNGSI DEWA: OTOMATISASI TAG PAKAI AI
// ==========================================
async function getSmartTagsWithAI(title: string, description: string, url: string) {
    try {
        if (!title) return ['Lainnya'];
        
        const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash-lite",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });
        
        const prompt = `
            Berikan maksimal 3 tag singkat untuk konten ini dalam bentuk array JSON string (contoh: ["Anime", "Art"]).
            URL: ${url}
            Judul: ${title}
            Deskripsi: ${description}
        `;
        
        const result = await model.generateContent(prompt);
        const tagsArray = JSON.parse(result.response.text())
        
        return Array.isArray(tagsArray) ? tagsArray : ['Lainnya'];
    } catch (error) {
        console.error("AI gagal mikir:", error);
        return ['Sistem'];
    }
}

// ==========================================
// UTILITY PARSE URL
// ==========================================
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

export const api = new Hono().basePath('/api');

// ==========================================
// 1. ENDPOINT METADATA (URL)
// ==========================================
api.post('/metadata', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);
    const userId = session.user.id;

    let body = await c.req.json();
    const targetUrl = parseUrl(body?.url);
    if (!targetUrl) return c.json({ error: 'Invalid url' }, 400);

    const existingUrl = await db.select().from(urls)
        .where(and(eq(urls.url, targetUrl), eq(urls.userId, userId))).limit(1);
    if (existingUrl[0]) return c.json({ error: 'Duplicate', message: 'Tautan sudah ada!' }, 409);

    const metaData = await fetchUrlMetadata(targetUrl);
    const now = Date.now();

    const finalCategoryName = body.category || 'Belum Disortir'; 
    let targetGroupId = null;

    const g = await db.select().from(groups)
        .where(and(eq(groups.name, finalCategoryName), eq(groups.userId, userId))).limit(1);
    
    if (g[0]) {
        targetGroupId = g[0].id;
    } else {
        const newGroup = await db.insert(groups).values({ name: finalCategoryName, userId: userId }).returning();
        targetGroupId = newGroup[0].id;
    }

    const insertedUrl = await db.insert(urls).values({ 
        url: targetUrl, groupId: targetGroupId, userId: userId, updatedAt: new Date(now) 
    }).returning();
    const urlRow = insertedUrl[0];

    await db.insert(metadata).values({ 
        urlId: urlRow.id, title: metaData.title, description: metaData.description, image: metaData.image, fetchedAt: new Date(now) 
    });

    // 🔥 FIRE AND FORGET AI
    if (!body.category) {
        getSmartTagsWithAI(metaData.title || '', metaData.description || '', targetUrl)
            .then(async (aiTags) => {
                if (aiTags && aiTags.length > 0) {
                    const autoCategory = aiTags[0] || 'Koleksi Baru';
                    
                    let newTargetGroupId = null;
                    const aiGroup = await db.select().from(groups)
                        .where(and(eq(groups.name, autoCategory), eq(groups.userId, userId))).limit(1);
                    
                    if (aiGroup[0]) {
                        newTargetGroupId = aiGroup[0].id;
                    } else {
                        const insertedAiGroup = await db.insert(groups).values({ name: autoCategory, userId: userId }).returning();
                        newTargetGroupId = insertedAiGroup[0].id;
                    }

                    await db.update(urls).set({ groupId: newTargetGroupId }).where(eq(urls.id, urlRow.id));

                    for (const tagName of aiTags) {
                        let tagRecords = await db.select().from(tags).where(eq(tags.name, tagName)).limit(1);
                        let currentTag = tagRecords[0];

                        if (!currentTag) {
                            const insertedTag = await db.insert(tags).values({ name: tagName }).returning();
                            currentTag = insertedTag[0];
                        }

                        const existingLink = await db.select().from(urlTags)
                            .where(and(eq(urlTags.urlId, urlRow.id), eq(urlTags.tagId, currentTag.id))).limit(1);

                        if (!existingLink[0]) {
                            await db.insert(urlTags).values({ urlId: urlRow.id, tagId: currentTag.id });
                        }
                    }
                }
            })
            .catch(err => console.error("Background AI gagal:", err));
    }

    return c.json({
        id: urlRow.id,
        url: urlRow.url,
        category: finalCategoryName,
        metadata: { title: metaData.title, description: metaData.description, image: metaData.image }
    });
});

api.patch('/metadata/:id', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

    const urlId = c.req.param('id');
    const { title, description } = await c.req.json();

    const urlCheck = await db.select().from(urls).where(and(eq(urls.id, urlId), eq(urls.userId, session.user.id))).limit(1);
    if (!urlCheck[0]) return c.json({ error: 'Forbidden' }, 403);

    try {
        await db.update(metadata)
            .set({ title: title || null, description: description || null, fetchedAt: new Date() })
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
    
    const userGroups = await db.select().from(groups).where(eq(groups.userId, session.user.id));
    return c.json(userGroups);
});

api.post('/groups', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

    const { name } = await c.req.json();
    try {
        await db.insert(groups).values({ name, userId: session.user.id });
        return c.json({ success: true });
    } catch (e) {
        return c.json({ error: 'Gagal membuat grup' }, 400);
    }
});

api.delete('/groups', async(c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

    const { name } = await c.req.json();
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

api.patch('/urls/:id/group', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

    const urlId = c.req.param('id');
    const { groupId: newGroupName } = await c.req.json(); 

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