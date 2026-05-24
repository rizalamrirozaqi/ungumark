import type { Session as BetterSession, User } from 'better-auth';

// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: BetterSession | null;
		}
	}
}

export {};
