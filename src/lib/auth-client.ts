import { createAuthClient } from 'better-auth/svelte';
import { env } from '$env/dynamic/public'; // 🔥 Pake ini biar kebaca di server & client

export const authClient = createAuthClient({
    // Sekarang dia bakal ngambil URL yang bener, baik saat dirakit Vercel maupun di browser
    // baseURL: env.PUBLIC_BETTER_AUTH_URL ?? 'http://localhost:5173',
});

export const { signIn, signUp, signOut, useSession } = authClient;