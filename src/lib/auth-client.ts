import { createAuthClient } from 'better-auth/svelte';
import { env } from '$env/dynamic/public'; // 🔥 Pake ini biar kebaca di server & client
import { sentinelClient } from "@better-auth/infra/client";

export const authClient = createAuthClient({
    plugins: [
        // ... other plugins
        sentinelClient()
    ]
});
export const { signIn, signUp, signOut, useSession } = authClient;