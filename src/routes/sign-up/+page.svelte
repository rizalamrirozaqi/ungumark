<script lang="ts">
    import { goto } from '$app/navigation';
    import { signUp, authClient } from '$lib/auth-client';

    let name = $state('');
    let email = $state('');
    let password = $state('');
    let confirmPassword = $state('');
    let error = $state<string | null>(null);
    let loading = $state(false);
    
    // Tambahan state buat nandain pendaftaran sukses
    let isSuccess = $state(false); 

    async function onSubmit(e: SubmitEvent) {
        e.preventDefault();
        error = null;

        if (password !== confirmPassword) {
            error = 'Password tidak cocok.';
            return;
        }
        if (password.length < 8) {
            error = 'Password minimal 8 karakter.';
            return;
        }
		if (!password.match('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$')) {
			error = 'Password harus mengandung huruf dan angka.';
			return;
		}

        loading = true;
        try {

			const domain = email.split('@')[1];

			const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
			const dnsData = await dnsResponse.json();
			if (!dnsData.Answer || dnsData.Answer.length === 0) {
				error = 'Domain email tidak valid.';
				loading=false;
				return;
			}

            await signUp.email({ name, email, password });
            
            isSuccess = true; 
        } catch (err) {
            error = err instanceof Error ? err.message : 'Daftar gagal.';
        } finally {
            loading = false;
        }
    }

    async function loginGoogle() {
        await authClient.signIn.social({
            provider: 'google',
            options : {callbackURL: '/'}
        });
    }
</script>

<svelte:head>
    <title>Daftar — Smart Bookmark</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center px-4">
    <div class="w-full max-w-sm">
        <div class="mb-6 text-center">
            <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Buat akun baru</h1>
            <p class="mt-1 text-sm text-slate-500">
                Sudah punya akun?
                <a href="/sign-in" class="font-medium text-indigo-600 hover:underline">Masuk</a>
            </p>
        </div>

        {#if isSuccess}
            <div class="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5 text-center">
                <div class="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                    <svg class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                </div>
                <h3 class="mb-2 text-lg font-semibold text-slate-900">Cek Kotak Masukmu!</h3>
                <p class="text-sm text-slate-500">
                    Link verifikasi telah dikirim ke <span class="font-medium text-slate-900">{email}</span>. Silakan klik link tersebut untuk mengaktifkan akunmu.
                </p>
                <button
                    onclick={() => goto('/sign-in')}
                    class="mt-6 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                    Kembali ke halaman Login
                </button>
            </div>
        {:else}
            <form
                class="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5"
                onsubmit={onSubmit}
            >
                <div class="flex flex-col gap-4">
                    <label class="flex flex-col gap-1.5">
                        <span class="text-xs font-medium text-slate-700">Nama</span>
                        <input
                            class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-indigo-500/30 placeholder:text-slate-400 focus:ring-4"
                            type="text"
                            placeholder="Nama kamu"
                            required
                            bind:value={name}
                        />
                    </label>

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
                            placeholder="Min. 8 karakter"
                            required
                            bind:value={password}
                        />
                    </label>

                    <label class="flex flex-col gap-1.5">
                        <span class="text-xs font-medium text-slate-700">Konfirmasi Password</span>
                        <input
                            class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-indigo-500/30 placeholder:text-slate-400 focus:ring-4"
                            type="password"
                            placeholder="Ulangi password"
                            required
                            bind:value={confirmPassword}
                        />
                    </label>

                    {#if error}
                        <p class="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
                    {/if}

                    <button
                        class="mt-1 inline-flex items-center justify-center rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={loading}
                        type="submit"
                    >
                        {loading ? 'Mendaftar…' : 'Buat akun'}
                    </button>

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
                </div>
            </form>
        {/if}
    </div>
</div>