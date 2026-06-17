import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { db } from '$lib/server/db/client';
import { metadata, urls, groups, urlTags, tags } from '$lib/server/db/schema';
import { auth } from '../auth';
import { fetchUrlMetadata } from '../scraper';
import { env } from '$env/dynamic/private';

async function cleanupGroupIfEmpty(groupId: string | null) {
    if (!groupId) return;
    
    const remainingUrls = await db.select().from(urls).where(eq(urls.groupId, groupId)).limit(1);
    
    if (remainingUrls.length === 0) {
        const grp = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
        
        if (grp[0] && grp[0].isAuto) {
            await db.delete(groups).where(eq(groups.id, groupId));
        }
    }
}

// OTOMATISASI TAG PAKE AI
async function getSmartTagsWithAI(title: string, description: string, url: string) {
    try {
        if (!title) return ['Lainnya'];
        
        const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash-lite",
            generationConfig: { responseMimeType: "application/json" }
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
        // 🔥 Kalau user nggak milih (body.category kosong), tandai isAuto = true
        const isSystemGenerated = !body.category;
        const newGroup = await db.insert(groups).values({ name: finalCategoryName, userId: userId, isAuto: isSystemGenerated }).returning();
        targetGroupId = newGroup[0].id;
    }

    const insertedUrl = await db.insert(urls).values({ 
        url: targetUrl, groupId: targetGroupId, userId: userId, updatedAt: new Date(now) 
    }).returning();
    const urlRow = insertedUrl[0];

    await db.insert(metadata).values({ 
        urlId: urlRow.id, title: metaData.title, description: metaData.description, image: metaData.image, fetchedAt: new Date(now) 
    });

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
                        // 🔥 Grup buatan AI murni = isAuto: true
                        const insertedAiGroup = await db.insert(groups).values({ name: autoCategory, userId: userId, isAuto: true }).returning();
                        newTargetGroupId = insertedAiGroup[0].id;
                    }

                    await db.update(urls).set({ groupId: newTargetGroupId }).where(eq(urls.id, urlRow.id));
                    await cleanupGroupIfEmpty(targetGroupId); // Hapus grup "Belum Disortir" kalau kosong

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
        
        const oldGroupId = urlToDel[0].groupId; // Simpan ID grup lamanya

        await db.delete(metadata).where(eq(metadata.urlId, body.id));
        await db.delete(urls).where(eq(urls.id, body.id));

        // 🔥 Panggil tukang sapu
        await cleanupGroupIfEmpty(oldGroupId);

        return c.json({ success: true });
    } catch (err) {
        return c.json({ error: 'Gagal menghapus data' }, 500);
    }
});

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
        // 🔥 Grup manual dari user = isAuto: false
        await db.insert(groups).values({ name, userId: session.user.id, isAuto: false });
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
            .set({ name: newName, isAuto: false }) 
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
    
    // Cari URL lama dulu buat dapet oldGroupId
    const urlCheck = await db.select().from(urls).where(and(eq(urls.id, urlId), eq(urls.userId, session.user.id))).limit(1);
    if (!urlCheck[0]) return c.json({ error: 'URL tidak ditemukan atau bukan milik Anda' }, 404);
    
    const oldGroupId = urlCheck[0].groupId;

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

        await cleanupGroupIfEmpty(oldGroupId);

        return c.json({ success: true, url: updated[0] });
    } catch (err) {
        return c.json({ error: 'Gagal mengupdate grup URL' }, 500);
    }
});



// ENDPOINT FITUR SHARING REPO

api.get('/shared/:groupId', async (c) => {
    const groupId = c.req.param('groupId');

    try {
        const targetGroup = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
        if (!targetGroup[0]) return c.json({ error: 'Koleksi tidak ditemukan' }, 404);

        const groupLinks = await db.select({
            id: urls.id,
            url: urls.url,
            title: metadata.title,
            description: metadata.description,
            image: metadata.image
        })
        .from(urls)
        .leftJoin(metadata, eq(metadata.urlId, urls.id))
        .where(eq(urls.groupId, groupId));

        return c.json({
            groupName: targetGroup[0].name,
            ownerId: targetGroup[0].userId, 
            links: groupLinks
        });
    } catch (err) {
        return c.json({ error: 'Gagal memuat koleksi publik' }, 500);
    }
});


api.post('/shared/:groupId/import', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) return c.json({ error: 'Harus login untuk mengimpor' }, 401);
    
    const userId = session.user.id;
    const sourceGroupId = c.req.param('groupId');
    
    try {
        // 1. Cek grup aslinya ada apa nggak
        const sourceGroup = await db.select().from(groups).where(eq(groups.id, sourceGroupId)).limit(1);
        if (!sourceGroup[0]) return c.json({ error: 'Koleksi sumber tidak ditemukan' }, 404);
        
        // Jangan biarin user import grupnya sendiri (ngapain wkwkwk)
        if (sourceGroup[0].userId === userId) {
            return c.json({ error: 'Ini sudah koleksi Anda sendiri kocak' }, 400);
        }

        // 2. Bikin Grup Baru di akun user yang lagi login
        const newGroupName = `${sourceGroup[0].name}`;

        let targetGroupId = null;

        const existGroup = await db.select().from(groups).where(
            and(eq(groups.name, newGroupName), eq(groups.userId, userId))
        ).limit(1);

        if(existGroup[0]) {
            targetGroupId = existGroup[0].id;
        }
        else {
            const newGroup = await db.insert(groups).values({ 
                name: newGroupName, 
                userId: userId, 
                isAuto: false 
            }).returning();
            targetGroupId = newGroup[0].id
        }


        // 3. Tarik semua URL dari grup asli
        const sourceUrls = await db.select().from(urls).where(eq(urls.groupId, sourceGroupId));

        // 4. Looping: Copy satu-satu ke akun user baru
        for (const sUrl of sourceUrls) {
            // Cek biar gak dobel kalau dia udah pernah nyimpen URL ini
            const isDuplicate = await db.select().from(urls)
                .where(and(eq(urls.url, sUrl.url), eq(urls.userId, userId))).limit(1);
            
            if (!isDuplicate[0]) {
                // Insert URL baru
                const insertedUrl = await db.insert(urls).values({
                    url: sUrl.url,
                    groupId: newGroupId,
                    userId: userId,
                    updatedAt: new Date()
                }).returning();

                // Ambil & copy metadata lama (biar gak usah panggil Scraper/AI lagi, biar ngebut!)
                const oldMeta = await db.select().from(metadata).where(eq(metadata.urlId, sUrl.id)).limit(1);
                
                if (oldMeta[0]) {
                    await db.insert(metadata).values({
                        urlId: insertedUrl[0].id,
                        title: oldMeta[0].title,
                        description: oldMeta[0].description,
                        image: oldMeta[0].image,
                        fetchedAt: new Date()
                    });
                }
            }
        }

        return c.json({ success: true, message: 'Berhasil diimpor!' });
    } catch (err) {
        return c.json({ error: 'Gagal mengimpor koleksi' }, 500);
    }
});