<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    let groupId = $page.params.id;
    let groupData: any = null;
    let loading = true;
    let importing = false;
    let importSuccess = false;

    onMount(async () => {
        try {
            const res = await fetch(`/api/shared/${groupId}`);
            if (res.ok) {
                groupData = await res.json();
            }
        } catch (err) {
            console.error(err);
        } finally {
            loading = false;
        }
    });

    async function handleImport() {
        importing = true;
        try {
            const res = await fetch(`/api/shared/${groupId}/import`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                importSuccess = true;
            } else {
                alert(data.error || 'Gagal mengimpor');
            }
        } catch (err) {
            alert('Terjadi kesalahan jaringan.');
        } finally {
            importing = false;
        }
    }
</script>

<svelte:head>
    <title>{groupData?.groupName ? `Koleksi: ${groupData.groupName}` : 'Koleksi Publik'} - UnguMark</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-5xl">
        {#if loading}
            <div class="flex justify-center py-32"><div class="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div></div>
        {:else if !groupData || groupData.error}
            <div class="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-100">
                <h1 class="text-2xl font-bold text-slate-900">Koleksi Tidak Ditemukan</h1>
                <p class="mt-2 text-slate-500">Tautan ini mungkin sudah kadaluarsa atau dihapus oleh pemiliknya.</p>
            </div>
        {:else}
            <div class="mb-10 flex flex-col items-center justify-between gap-6 rounded-[2.5rem] bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white shadow-xl sm:flex-row sm:p-10">
                <div>
                    <span class="mb-2 block text-xs font-bold uppercase tracking-widest text-purple-200">Koleksi Publik</span>
                    <h1 class="text-3xl font-black sm:text-4xl">{groupData.groupName}</h1>
                    <p class="mt-2 text-sm text-purple-100">{groupData.links.length} Tautan Tersimpan</p>
                </div>
                
                {#if importSuccess}
                    <div class="rounded-2xl bg-white/20 px-6 py-3 text-sm font-bold backdrop-blur">✅ Berhasil Diimpor!</div>
                {:else}
                    <button 
                        onclick={handleImport} 
                        disabled={importing}
                        class="flex shrink-0 items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-purple-700 shadow-md transition hover:scale-105 disabled:opacity-50"
                    >
                        {#if importing}
                            Menyalin...
                        {:else}
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                            Simpan ke Akun Saya
                        {/if}
                    </button>
                {/if}
            </div>

            <div class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
                {#each groupData.links as item}
                    <a href={item.url} target="_blank" rel="noopener noreferrer" class="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-purple-200">
                        <div class="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                            {#if item.image}
                                <img src={item.image} alt="" class="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                            {:else}
                                <div class="flex h-full items-center justify-center text-slate-300"><svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                            {/if}
                        </div>
                        <div class="flex flex-1 flex-col p-5">
                            <h3 class="text-sm font-bold text-slate-900 line-clamp-2 sm:text-base group-hover:text-purple-600">{item.title ?? 'Tanpa Judul'}</h3>
                            <p class="mt-2 line-clamp-2 text-xs text-slate-500">{item.description ?? 'Deskripsi tidak tersedia.'}</p>
                        </div>
                    </a>
                {/each}
            </div>
        {/if}
    </div>
</div>