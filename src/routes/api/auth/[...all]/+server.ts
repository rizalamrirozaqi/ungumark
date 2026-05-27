import { auth } from '$lib/server/auth';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ request }) => auth.handler(request);
export const POST: RequestHandler = ({ request }) => auth.handler(request);
export const OPTIONS: RequestHandler = ({ request }) => auth.handler(request);
export const PATCH: RequestHandler = ({ request }) => auth.handler(request);
export const PUT: RequestHandler = ({ request }) => auth.handler(request);
export const DELETE: RequestHandler = ({ request }) => auth.handler(request);