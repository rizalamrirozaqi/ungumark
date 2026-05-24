<script lang="ts">
    import { goto } from '$app/navigation';
    import { signOut, useSession, authClient } from '$lib/auth-client';

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

    // // Fungsi untuk memproses foto dari galeri menjadi teks Base64
    // function handleFileChange(event: Event) {
    //     const input = event.target as HTMLInputElement;
    //     const file = input.files?.[0];
    //     if (!file) return;

    //     // Validasi tipe file
    //     if (!file.type.startsWith('image/')) {
    //         alert('Format file tidak didukung. Harap pilih gambar.');
    //         input.value = '';
    //         return;
    //     }

    //     // Batasi ukuran file (WAJIB KECIL! Maksimal 500 KB agar tidak nge-lag)
    //     if (file.size > 500 * 1024) {
    //         alert('Ukuran gambar terlalu besar! Maksimal 500 KB (setengah MegaByte) demi performa.');
    //         // Reset input
    //         input.value = '';
    //         return;
    //     }

    //     const reader = new FileReader();
    //     reader.onload = (e) => {
    //         if (e.target?.result && typeof e.target.result === 'string') {
    //             // Simpan hasil konversi ke state (otomatis mengubah live preview)
    //             editImage = e.target.result;
    //         }
    //     };
    //     reader.readAsDataURL(file);
    // }

    async function handleUpdateProfile(e: SubmitEvent) {
        e.preventDefault();
        if (!editName.trim()) return;
        
        isUpdating = true;
        try {
            const { error } = await authClient.updateUser({ 
                name: editName.trim(),
                // image: editImage.trim() || null
            });
            
            if (error) {
                alert(`Gagal menyimpan profil: ${error.message || 'Error tidak diketahui'}`);
                return;
            }

            isOpen = false;
            window.location.reload(); // Refresh halaman agar data ter-update sempurna
        } catch (err) {
            alert(`Gagal memperbarui profil akibat masalah jaringan.`);
        } finally {
            isUpdating = false;
        }
    }
</script>

{#if isOpen && $session.data?.user}
    <div 
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm"
        onclick={() => isOpen = false}
    >
        <div 
            class="w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-purple-900/10 ring-1 ring-slate-100"
            onclick={(e) => e.stopPropagation()} 
        >
            
            <div class="mb-8 flex flex-col items-center text-center">
                
                <!-- <button 
                    type="button" 
                    class="relative mb-4 flex h-24 w-24 items-center justify-center rounded-full hover:opacity-80 transition-opacity focus:outline-none focus:ring-4 focus:ring-purple-200"
                    onclick={() => fileInput.click()}
                    title="Pilih foto dari galeri (HP/Laptop)"
                > -->
                    <!-- {#if editImage || $session.data.user.image} -->
                        <img 
                            src={editImage || $session.data.user.image} 
                            alt="Avatar Preview" 
                            class="h-25 w-25 rounded-full object-cover ring-4 ring-purple-50" 
                            />
                            <!-- onerror={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + editName + '&background=E9D5FF&color=7E22CE')} -->
                    <!-- {:else}
                        <div class="flex h-full w-full items-center justify-center rounded-full bg-purple-100 text-3xl font-bold text-purple-700 ring-4 ring-purple-50 ">
                            {(editName || $session.data.user.email || '?')[0].toUpperCase()}
                        </div>
                    {/if}
                    
                    <div class="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm ring-2 ring-white hover:cursor-pointer">
                        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </div> -->
                <!-- </button> -->
                
                <!-- <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp" 
                    class="hidden" 
                    bind:this={fileInput} 
                    onchange={handleFileChange} 
                /> -->

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