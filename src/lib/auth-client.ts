import { createAuthClient } from 'better-auth/svelte';
import { env } from '$env/dynamic/public'; // 🔥 Pake ini biar kebaca di server & client
import { sentinelClient } from "@better-auth/infra/client";
import { dev } from '$app/environment';

export const authClient = createAuthClient({
    baseURL: dev ? 'http://localhost:5173' : 'https://ungumark.my.id',
    plugins: [
        sentinelClient()
    ]
});
export const { signIn, signUp, signOut, useSession } = authClient;