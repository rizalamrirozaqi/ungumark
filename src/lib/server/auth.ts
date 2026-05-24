import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { env } from '$env/dynamic/private';

import { db } from './db/client';
import * as schema from './db/auth-schema';

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL ?? 'http://localhost:5173',
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		schema: {
			...schema
		}
	}),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8
	},
	socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        }
    }
});

export type Session = typeof auth.$Infer.Session;
