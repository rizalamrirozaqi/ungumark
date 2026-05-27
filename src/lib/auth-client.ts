import { createAuthClient } from 'better-auth/svelte';
import { env } from '$env/dynamic/public'; // 🔥 Pake ini biar kebaca di server & client

export const authClient = createAuthClient();
export const { signIn, signUp, signOut, useSession } = authClient;