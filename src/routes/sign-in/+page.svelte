<script lang="ts">
    import { goto } from '$app/navigation';
    import { signIn, authClient } from '$lib/auth-client';

    let email = $state('');
    let password = $state('');
    let error = $state<string | null>(null);
    let loading = $state(false);

    async function onSubmit(e: SubmitEvent) {
        e.preventDefault();
        error = null;
        loading = true;
        
        try {
            // Ambil objek error dari hasil return signIn
            const { data, error: err } = await signIn.email({ email, password });
            
            // Kalau ada error dari Better Auth (misal: akun tidak ada / password salah)
            if (err) {
                error = err.message || 'Email atau password salah.';
            } else {
                // Kalau sukses, baru pindah halaman
                goto('/');
            }
        } catch (err) {
            // Blok catch ini sekarang hanya akan terpanggil kalau ada masalah jaringan (koneksi putus/server mati)
            error = err instanceof Error ? err.message : 'Sign in gagal akibat masalah jaringan.';
        } finally {
            loading = false;
        }
    }

    async function loginGoogle() {
        await authClient.signIn.social({
            provider: 'google',
            options : { callbackURL: '/' }
        });
    }
</script>

<svelte:head>
	<title>Sign In — Smart Bookmark</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-sm">
		<div class="mb-6 text-center">
			<h1 class="text-2xl font-semibold tracking-tight text-slate-900">Masuk ke akunmu</h1>
			<p class="mt-1 text-sm text-slate-500">
				Belum punya akun?
				<a href="/sign-up" class="font-medium text-indigo-600 hover:underline">Daftar</a>
			</p>
		</div>

		<form
			class="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5"
			onsubmit={onSubmit}
		>
			<div class="flex flex-col gap-4">
				<label class="flex flex-col gap-1.5">
					<span class="text-xs font-medium text-slate-700">Email</span>
					<input
						class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-indigo-500/30 placeholder:text-slate-400 focus:ring-4"
						type="email"
						placeholder="kamu@email.com"
						required
						bind:value={email}
					/>
				</label>

				<label class="flex flex-col gap-1.5">
					<span class="text-xs font-medium text-slate-700">Password</span>
					<input
						class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-indigo-500/30 placeholder:text-slate-400 focus:ring-4"
						type="password"
						placeholder="••••••••"
						required
						bind:value={password}
					/>
				</label>

				{#if error}
					<p class="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
				{/if}

				<button
					class="mt-1 inline-flex items-center justify-center rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
					disabled={loading}
					type="submit"
				>
					{loading ? 'Masuk…' : 'Masuk'}
				</button>
			</div>
			<div class="relative mt-6 mb-4">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-slate-200"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="bg-white px-2 text-slate-500">Atau</span>
				</div>
			</div>
			<button
				onclick={loginGoogle}
				type="button"
				class="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
			>
				<svg class="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
					<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
					<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
					<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
				</svg>
				Lanjutkan dengan Google
			</button>
		</form>
	</div>
</div>
