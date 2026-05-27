import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { auth } from '$lib/server/auth';
import { api } from '$lib/server/api/hono';

// Hono handles all /api/* EXCEPT /api/auth (that goes to better-auth).
const honoHandle: Handle = async ({ event, resolve }) => {
	if (
		event.url.pathname.startsWith('/api') &&
		!event.url.pathname.startsWith('/api/auth') &&
		!event.url.pathname.startsWith('/api/cron')
	) {
		return api.fetch(event.request);
	}
	return resolve(event);
};

// Inject session into event.locals so pages can read it.
const authHandle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	event.locals.user = session?.user ?? null;
	event.locals.session = session?.session ?? null;
	return resolve(event);
};


export const handle = sequence(honoHandle, authHandle);
