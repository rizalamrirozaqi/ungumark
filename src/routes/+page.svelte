<script lang="ts">
    import type { PageData } from './$types';
    import { BookmarkStore } from './bookmarkStore.svelte';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    
    import Header from './homePageComponents/Header.svelte';
    import TambahUrl from './homePageComponents/TambahUrl.svelte';
    import TabAndSearch from './homePageComponents/TabAndSearch.svelte';
    import GroupView from './homePageComponents/GroupView.svelte';
    import AllView from './homePageComponents/AllView.svelte';
    import Modal from './homePageComponents/Modal.svelte';

    let { data } = $props<{ data: PageData }>();
    
    // Inisialisasi Class Store
    const store = new BookmarkStore();

    // Singkronisasi data dari Server SvelteKit (load function) ke Store
    $effect(() => {
        store.items = data.items;
        store.q = data.q ?? '';
    });

// Cek apakah ada data yang dibagikan dari luar (misal: lewat fitur "Share" di Android)
    onMount(() => {
        // Karena kadang user ngirim teks panjang yang ngandung link (misal dari WA/Twitter)
        // Kita butuh fungsi kecil buat ngekstrak link-nya
        function extractUrl(text: string | null) {
            if (!text) return null;
            // Cek kalau formatnya murni URL
            if (text.startsWith('http')) return text;
            // Kalau bentuknya teks campur URL, cari string yang diawali http/https
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const match = text.match(urlRegex);
            return match ? match[0] : null;
        }

        const rawUrl = $page.url.searchParams.get('url');
        const rawText = $page.url.searchParams.get('text');
        
        // Coba ekstrak URL dari parameter 'url' atau 'text'
        const sharedUrl = extractUrl(rawUrl) || extractUrl(rawText);

        if (sharedUrl) {
            console.log("Asik, dapat link dari luar:", sharedUrl);
            
            // Masukkan URL yang ditangkap ke input box
            store.inputUrl = sharedUrl;

            // Bersihkan URL di browser biar kalau di-refresh nggak nyimpen link yang sama lagi
            // Trik ini menggunakan History API bawaan browser untuk ngilangin parameter ?text=... 
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    });
</script>

<svelte:head>
    <title>UnguMark - Smart Bookmark & Link Manager</title>
    <meta name="description" content="Simpan, atur, dan temukan kembali semua link pentingmu dalam satu tempat yang rapi dan terorganisir dengan UnguMark." />
    <meta name="keywords" content="bookmark manager, simpan link, svelte bookmark, link manager, ungumark" />
    
    <meta property="og:title" content="UnguMark - Smart Bookmark & Link Manager" />
    <meta property="og:description" content="Simpan, atur, dan temukan kembali semua link pentingmu dalam satu tempat dengan mudah." />
    <meta property="og:url" content="https://ungumark.vercel.app/" />
    <meta property="og:type" content="website" />
    
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="UnguMark - Smart Bookmark Manager" />
    <meta name="twitter:description" content="Simpan, atur, dan temukan kembali semua link pentingmu dalam satu tempat." />
    <meta name="google-site-verification" content="hT-5zdyxB2lYDGTrLN3nkYsqDJOC9ZQYBKM349WR4z8" />
</svelte:head>

<div class="min-h-screen bg-slate-50/50 font-sans text-slate-800 selection:bg-purple-600 selection:text-white will-change-transform">
    <main class="mx-auto flex max-w-6xl flex-1 flex-col px-4 py-10">
        <Header />

        <section class="mb-20">
            <TambahUrl 
                bind:inputUrl={store.inputUrl} 
                bind:selectedGroup={store.selectedGroup} 
                manualGroups={store.manualGroups} 
                isLoading={store.isLoading} 
                onSubmit={store.onSubmit} 
                onCreateNew={store.createNewGroup}
            />
        </section>

        <section>
            <TabAndSearch 
                bind:viewMode={store.viewMode} 
                bind:activeCategory={store.activeCategory} 
                bind:q={store.q} 
                onCreateNew={store.createNewGroup}
            />

            {#if store.viewMode === 'groups'}
                <GroupView 
                    manualGroups={store.manualGroups}
                    items={store.items}
                    onRename={store.promptRenameGroup}
                    onDelete={store.deleteGroup}
                    onOpen={store.openGroup}
                />
            {:else}
                <AllView 
                    filteredItems={store.filteredItems}
                    activeCategory={store.activeCategory}
                    bind:q={store.q}
                    onMove={store.promptMoveItem}
                    onDelete={store.handleDeleteItem}
                    onEdit={store.editMetadata}
                    onMobileMenu={store.handleMobileMenu}
                    onOpenGroup={store.openGroup}
                    onRenameGroup={store.promptRenameGroup}
                    onCloseGroup={() => { store.viewMode = 'groups'; store.activeCategory = 'all'; }}
                />
            {/if}
        </section>
    </main>

    <Modal bind:modal={store.modal} />
</div>