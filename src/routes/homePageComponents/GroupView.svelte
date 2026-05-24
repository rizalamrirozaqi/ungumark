<script lang="ts">
    let { 
        manualGroups, 
        items, 
        onRename, 
        onDelete, 
        onOpen 
    } = $props<{
        manualGroups: string[];
        items: any[];
        onRename: (name: string, e: Event) => void;
        onDelete: (name: string, e: Event) => void;
        onOpen: (name: string) => void;
    }>();
</script>


{#if manualGroups.length === 0}
    <div class="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-200 py-32 text-center bg-white/50">
        <div class="mb-4 rounded-full bg-purple-50 p-4 text-purple-300">
            <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        </div>
        <h3 class="text-xl font-bold text-slate-900">Belum ada Koleksi</h3>
        <p class="mt-2 text-sm text-slate-500">Buat grup pertama Anda untuk merapikan tautan.</p>
    </div>
{:else}
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {#each manualGroups as groupName}
            {@const groupItems = items.filter(i => i.category === groupName)}
            
            <div
                role="button"
                tabindex="0"
                onkeydown={(e) => e.key === 'Enter' && onOpen(groupName)}
                onclick={() => onOpen(groupName)}
                class="group relative flex cursor-pointer flex-col overflow-hidden rounded-[2rem] bg-white p-2 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-purple-900/5 hover:ring-purple-200"
            >
                <div class="absolute right-4 top-4 z-30 flex gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button onclick={(e) => onRename(groupName, e)} class="rounded-full bg-white/90 p-2 text-slate-500 shadow-sm backdrop-blur transition hover:bg-purple-600 hover:text-white" title="Edit">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onclick={(e) => onDelete(groupName, e)} class="rounded-full bg-white/90 p-2 text-slate-500 shadow-sm backdrop-blur transition hover:bg-rose-500 hover:text-white" title="Hapus">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div class="grid aspect-video grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-2xl bg-slate-50">
                    {#each Array(4) as _, i}
                        <div class="bg-slate-100 relative overflow-hidden">
                            {#if groupItems[i]?.metadata?.image}
                                <img src={groupItems[i].metadata.image} alt="" class="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                            {/if}
                        </div>
                    {/each}
                </div>
                <div class="p-5 text-center">
                    <h3 class="truncate text-lg font-bold text-slate-900">{groupName}</h3>
                    <p class="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{groupItems.length} Tautan</p>
                </div>
            </div>
        {/each}
    </div>
{/if}