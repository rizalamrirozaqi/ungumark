import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { env } from '$env/dynamic/private';

import * as schema from './schema';

const url = env.TURSO_DATABASE_URL;
if (!url) {
	throw new Error('Missing env: TURSO_DATABASE_URL');
}

export const turso = createClient({
	url,
	authToken: env.TURSO_AUTH_TOKEN
});

export const db = drizzle(turso, { schema });

