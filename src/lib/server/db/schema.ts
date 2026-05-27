import { relations, sql } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const groups = sqliteTable(
    'groups',
    {
        id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
        name: text('name').notNull(),
        
        // --- 1. TAMBAHKAN ID PEMILIK ---
        userId: text('user_id').notNull(), 
        
        createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    },
    (t) => ({
        // --- 2. UBAH LOGIKA UNIK ---
        // Kombinasi nama grup & userId harus unik. 
        // User A dan User B boleh sama-sama punya grup "Manga", 
        // tapi User A tidak boleh punya dua grup "Manga".
        nameUserUnique: uniqueIndex('groups_name_user_unique').on(t.name, t.userId)
    })
);

export const urls = sqliteTable(
    'urls',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        url: text('url').notNull(),
        
        userId: text('user_id').notNull(),

        createdAt: integer('created_at', { mode: 'timestamp_ms' })
            .notNull()
            .default(sql`(unixepoch() * 1000)`),
        updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
            .notNull()
            .default(sql`(unixepoch() * 1000)`),
        groupId: text('group_id')
            .references(() => groups.id, { onDelete: 'set null' })
    },
    (t) => ({
        // Satu user nggak boleh nyimpen URL yang sama dua kali,
        // tapi user lain boleh nyimpen URL tersebut.
        urlUserUnique: uniqueIndex('urls_url_user_unique').on(t.url, t.userId)
    })
);

export const metadata = sqliteTable('metadata', {
    urlId: text('url_id')
        .notNull()
        .primaryKey()
        .references(() => urls.id, { onDelete: 'cascade' }),
    title: text('title'),
    description: text('description'),
    image: text('image'),
    fetchedAt: integer('fetched_at', { mode: 'timestamp_ms' })
        .notNull()
        .default(sql`(unixepoch() * 1000)`)
});

export const tags = sqliteTable(
    'tags',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        name: text('name').notNull()
    },
    (t) => ({
        nameUnique: uniqueIndex('tags_name_unique').on(t.name)
    })
);

export const urlTags = sqliteTable(
    'url_tags',
    {
        urlId: text('url_id')
            .notNull()
            .references(() => urls.id, { onDelete: 'cascade' }),
        tagId: text('tag_id')
            .notNull()
            .references(() => tags.id, { onDelete: 'cascade' })
    },
    (t) => ({
        pk: primaryKey({ columns: [t.urlId, t.tagId] })
    })
);

// =====================================
// RELATIONS
// =====================================

export const groupsRelations = relations(groups, ({ many }) => ({
    urls: many(urls)
}));

export const urlsRelations = relations(urls, ({ one, many }) => ({
    metadata: one(metadata, { fields: [urls.id], references: [metadata.urlId] }),
    urlTags: many(urlTags),
    group: one(groups, { fields: [urls.groupId], references: [groups.id] })
}));

export const metadataRelations = relations(metadata, ({ one }) => ({
    url: one(urls, { fields: [metadata.urlId], references: [urls.id] })
}));

export const tagsRelations = relations(tags, ({ many }) => ({
    urlTags: many(urlTags)
}));

export const urlTagsRelations = relations(urlTags, ({ one }) => ({
    url: one(urls, { fields: [urlTags.urlId], references: [urls.id] }),
    tag: one(tags, { fields: [urlTags.tagId], references: [tags.id] })
}));