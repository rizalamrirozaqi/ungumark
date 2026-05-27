<script lang="ts">
    import { goto } from '$app/navigation';
    import { signOut, useSession, authClient } from '$lib/auth-client';
    import { fade, fly } from 'svelte/transition';

    let { isOpen = $bindable() } = $props<{ isOpen: boolean }>();

    const session = useSession();
    let editName = $state('');
    let editImage = $state(''); // Akan menampung teks Base64 dari foto
    let isUpdating = $state(false);
    
    // Referensi untuk tag <input type="file"> yang disembunyikan
    let fileInput: HTMLInputElement;

    // Mengisi otomatis nama & foto saat modal dibuka
    $effect(() => {
        if (isOpen && $session.data?.user) {
            editName = $session.data.user.name || '';
            editImage = $session.data.user.image || '';
        }
    });

    async function handleSignOut() {
        await signOut();
        isOpen = false;
        goto('/sign-in');
    }

    async function handleUpdateProfile(e: SubmitEvent) {
        e.preventDefault();
        if (!editName.trim()) return;
        
        isUpdating = true;
        try {
            const { error } = await authClient.updateUser({ 
                name: editName.trim(),
            });
            
            if (error) {
                alert(`Gagal menyimpan profil: ${error.message || 'Error tidak diketahui'}`);
                return;
            }

            isOpen = false;
            window.location.reload(); 
        } catch (err) {
            alert(`Gagal memperbarui profil akibat masalah jaringan.`);
        } finally {
            isUpdating = false;
        }
    }
</script>

{#if isOpen && $session.data?.user}
    <div 
        transition:fade={{ duration:150 }}
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4"
        style="will-change: opacity;"
        onclick={() => isOpen = false}
    >
        <div 
            transition:fly={{ y: 20, duration: 250, opacity: 1 }}
            class="w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-purple-900/10 ring-1 ring-slate-100"
            onclick={(e) => e.stopPropagation()} 
        >
            
            <div class="mb-8 flex flex-col items-center text-center">
                        {#if $session.data.user.image}
                            <img src={$session.data.user.image} alt="Avatar" class="h-25 w-25 rounded-full object-cover ring-2 ring-purple-100" />
                        {:else}
                            <div class="flex h-25 w-25 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700 ring-1 ring-purple-200">
                                {($session.data.user.name || $session.data.user.email || '?')[0].toUpperCase()}
                            </div>
                        {/if}

                <h3 class="text-xl font-bold text-slate-900">Pengaturan Profil</h3>
                <p class="text-sm font-medium text-slate-500">Sesuaikan identitas akunmu.</p>
            </div>

            <form onsubmit={handleUpdateProfile} class="flex flex-col gap-5">
                
                <label class="flex flex-col gap-2">
                    <span class="text-xs font-bold uppercase tracking-widest text-slate-500">Nickname - 名前</span>
                    <input 
                        type="text" 
                        class="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-2 focus:ring-purple-500"
                        placeholder="Ketik namamu..."
                        bind:value={editName}
                        required
                    />
                </label>

                <label class="flex flex-col gap-2">
                    <span class="text-xs font-bold uppercase tracking-widest text-slate-500">Email - 電子メール</span>
                    <input 
                        type="text" 
                        class="w-full cursor-not-allowed rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500 outline-none ring-1 ring-slate-200"
                        value={$session.data.user.email}
                        disabled
                    />
                </label>

                <div class="mt-4 flex items-center gap-4 flex-row sm:justify-between">
                    <button 
                        type="button"
                        onclick={handleSignOut}
                        class="text-sm font-bold text-rose-500 transition hover:text-rose-600 hover:underline hover:cursor-pointer"
                    >
                        Keluar
                    </button>

                    <div class="flex w-full gap-3 sm:w-auto justify-end">
                        <button 
                            type="button"
                            onclick={() => isOpen = false}
                            class="rounded-2xl px-5 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 hover:cursor-pointer"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit"
                            disabled={isUpdating || !editName.trim()}
                            class="hover:cursor-pointer w-30 sm:w-full rounded-2xl bg-purple-600 px-2 sm:px-8 py-1 sm:py-3.5 text-sm font-bold text-white shadow-md shadow-purple-600/20 transition-all hover:-translate-y-0.5 hover:bg-purple-700 hover:shadow-purple-600/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
                        >
                            {isUpdating ? 'Menyimpan...' : 'Simpan Profil'}
                        </button>
                    </div>
                </div>
            </form>

        </div>
    </div>
{/if}