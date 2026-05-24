<script lang="ts">
    import type { PageData } from './$types';
    import { BookmarkStore } from './bookmarkStore.svelte';
    
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
</script>

<div class="min-h-screen bg-slate-50/50 font-sans text-slate-800 selection:bg-purple-600 selection:text-white">
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