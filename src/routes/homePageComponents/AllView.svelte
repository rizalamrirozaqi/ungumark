<script lang="ts">
    let { 
        filteredItems, 
        activeCategory, 
        q = $bindable(), 
        onMove, 
        onDelete, 
        onEdit,
        onOpenGroup, 
        onRenameGroup, 
        onCloseGroup,
        onMobileMenu
    } = $props<{
        filteredItems: any[];
        activeCategory: string;
        q: string;
        onMove: (item: any) => void;
        onDelete: (id: string) => void;
        onEdit: (id: string) => void;
        onOpenGroup: (name: string) => void;
        onRenameGroup: (name: string, e: Event) => void;
        onCloseGroup: () => void;
        onMobileMenu: (item: any) => void;
    }>();
</script>

{#if activeCategory !== 'all'}
    <div class="mb-10 flex flex-col gap-4 rounded-3xl bg-purple-50/50 p-6 ring-1 ring-purple-100 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
            <span class="mb-1 block text-xs font-bold uppercase tracking-widest text-purple-400">Sedang Melihat Koleksi</span>
            <h2 class="text-2xl font-bold text-slate-900 sm:text-3xl">{activeCategory}</h2>
            <p class="mt-1 text-sm font-medium text-slate-500">{filteredItems.length} tautan tersimpan</p>
        </div>
        <div class="flex gap-3">
            <button onclick={(e) => onRenameGroup(activeCategory, e)} class="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-purple-600 shadow-sm ring-1 ring-purple-100 transition hover:bg-purple-100">
                Edit Nama
            </button>
            <button onclick={onCloseGroup} class="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
                Tutup
            </button>
        </div>
    </div>
{/if}

{#if filteredItems.length === 0}
    <div class="flex flex-col items-center justif   y-center rounded-[2.5rem] border-2 border-dashed border-slate-200 py-32 text-center bg-white/50">
        <div class="mb-4 rounded-full bg-slate-100 p-4 text-slate-300">
            <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        </div>
        <h3 class="text-xl font-bold text-slate-900">Arsip Kosong</h3>
        <p class="mt-2 text-sm text-slate-500">Belum ada tautan yang ditemukan.</p>
        {#if q}
            <button onclick={() => { q = ''; }} class="mt-4 rounded-full bg-purple-50 px-4 py-2 text-xs font-bold text-purple-600 transition hover:bg-purple-100">RESET PENCARIAN</button>
        {/if}
    </div>
{:else}
    <div class="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
        {#each filteredItems as item (item.id)}
            <article class="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/5 hover:ring-purple-100 sm:rounded-[2rem]">
                            
                <div class="relative aspect-[16/10] w-full overflow-hidden bg-slate-50">
                    
                    <div class="absolute right-2 top-2 z-20 opacity-100 transition-opacity duration-300 group-hover:opacity-100 sm:right-3 sm:top-3 sm:opacity-0">
                        <div class="hidden sm:flex gap-1.5">
                            <button onclick={(e) => { e.stopPropagation(); onEdit(item.id)}} class="rounded-full bg-white/95 p-2.5 text-slate-500 shadow-sm transition hover:bg-blue-500 hover:text-white" title="Edit Detail">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button onclick={(e) => { e.stopPropagation(); onMove(item)}} class="rounded-full bg-white/95 p-2.5 text-slate-500 shadow-sm transition hover:bg-purple-600 hover:text-white" title="Pindah Grup">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            </button>
                            <button onclick={(e) => { e.stopPropagation(); onDelete(item.id)}} class="rounded-full bg-white/95 p-2.5 text-slate-500 shadow-sm transition hover:bg-rose-500 hover:text-white" title="Hapus">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>

                        <button onclick={(e) => { e.stopPropagation(); onMobileMenu(item)}} class="rounded-full bg-white/95 p-1.5 text-slate-500 shadow-sm transition hover:bg-slate-200 sm:hidden">
                            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="5" r="2.5" />
                                <circle cx="12" cy="12" r="2.5" />
                                <circle cx="12" cy="19" r="2.5" />
                            </svg>
                        </button>
                    </div>

                    {#if item.category && activeCategory === 'all'}
                        <button 
                            onclick={(e) => { e.stopPropagation(); onOpenGroup(item.category)}}
                            class="absolute left-2 top-2 z-10 rounded-full bg-white/95 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-purple-700 shadow-sm transition hover:scale-105 sm:left-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-[10px]"
                        >
                            {item.category}
                        </button>
                    {/if}

                    {#if item.metadata?.image}
                        <img src={item.metadata.image} alt="" class="h-full w-full object-cover transform-gpu transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    {:else}
                        <div class="flex h-full items-center justify-center text-slate-300">
                            <svg class="h-8 w-8 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                    {/if}
                </div>

                <div class="flex flex-1 flex-col p-3 sm:p-6">
                    <h3 class="text-sm font-bold leading-snug text-slate-900 line-clamp-2 transition group-hover:text-purple-600 sm:text-lg">{item.metadata?.title ?? 'Tanpa Judul'}</h3>
                    <p class="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 sm:mt-3 sm:text-sm">{item.metadata?.description ?? 'Deskripsi tidak tersedia.'}</p>
                    
                    <div class="mt-auto pt-3 sm:pt-6">
                        <a href={item.url} target="_blank" class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 transition hover:text-purple-700 sm:gap-1.5 sm:text-xs">
                            <span class="sm:hidden">Kunjungi</span>
                            <span class="hidden sm:inline">Kunjungi Tautan</span>
                            <svg class="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </a>
                    </div>
                </div>
            </article>
        {/each}
    </div>
{/if}