<script lang="ts">
    let { 
        filteredItems, activeCategory, q = $bindable(), 
        layoutMode, // 🔥 Tangkap layoutMode
        onMove, onDelete, onEdit, onOpenGroup, onRenameGroup, onCloseGroup, onMobileMenu
    } = $props<{
        filteredItems: any[]; activeCategory: string; q: string;
        layoutMode: 'grid' | 'list';
        onMove: (item: any) => void; onDelete: (id: string) => void; onEdit: (id: string) => void;
        onOpenGroup: (name: string) => void; onRenameGroup: (name: string, e: Event) => void;
        onCloseGroup: () => void; onMobileMenu: (item: any) => void;
    }>();
</script>



{#if activeCategory !== 'all'}
    <div class="mb-8 flex flex-col gap-4 rounded-[2rem] bg-gradient-to-r from-purple-50 to-white p-6 ring-1 ring-purple-100 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
            <span class="mb-1 block text-[10px] font-bold uppercase tracking-widest text-purple-500">Melihat Koleksi</span>
            <h2 class="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{activeCategory}</h2>
            <p class="mt-1 text-sm font-semibold text-slate-500">{filteredItems.length} tautan tersimpan</p>
        </div>
        <div class="flex gap-2">
            <button onclick={(e) => onRenameGroup(activeCategory, e)} class="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-purple-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:cursor-pointer">Edit Nama</button>
            <button onclick={onCloseGroup} class="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-slate-800 hover:cursor-pointer">Tutup</button>
        </div>
    </div>
{:else}
    <h2 class="sr-only">Semua Koleksi Tautan</h2>
{/if}



{#if filteredItems.length === 0}
    <div class="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-200 py-24 text-center bg-white/40">
        <div class="mb-4 rounded-full bg-slate-100 p-4 text-slate-300"><svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg></div>
        <h3 class="text-xl font-bold text-slate-900">Arsip Kosong</h3>
        <p class="mt-2 text-sm text-slate-500">Belum ada tautan yang ditemukan.</p>
        {#if q}<button onclick={() => { q = ''; }} class="mt-5 rounded-full bg-purple-100 px-5 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-200">HAPUS PENCARIAN</button>{/if}
    </div>
{:else}
    <div class={layoutMode === 'grid' ? "grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-4"}>
        {#each filteredItems as item (item.id)}
            
            {#if layoutMode === 'grid'}
                <article onclick={() => window.open(item.url, '_blank')} class="hover:scale-[0.99] group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/10 hover:ring-purple-200 hover:cursor-pointer">
                    <div class="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                        <div class="absolute right-3 top-3 z-20 flex gap-1.5 opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100">
                            <button onclick={(e) => { e.stopPropagation(); onMobileMenu(item)}} class="rounded-full bg-white/90 p-1.5 text-slate-600 shadow-sm backdrop-blur transition hover:bg-slate-200 sm:hidden"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2.5" /><circle cx="12" cy="12" r="2.5" /><circle cx="12" cy="19" r="2.5" /></svg></button>
                            <div class="hidden sm:flex gap-1.5">
                                <button onclick={(e) => { e.stopPropagation(); onEdit(item.id)}} class="z-[100] rounded-full bg-white/90 p-2 text-slate-600 shadow-sm backdrop-blur hover:bg-blue-500 hover:text-white hover:cursor-pointer"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                <button onclick={(e) => { e.stopPropagation(); onMove(item)}} class="z-[100] rounded-full bg-white/90 p-2 text-slate-600 shadow-sm backdrop-blur hover:bg-purple-600 hover:text-white hover:cursor-pointer"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg></button>
                                <button onclick={(e) => { e.stopPropagation(); onDelete(item.id)}} class="z-[100] rounded-full bg-white/90 p-2 text-slate-600 shadow-sm backdrop-blur hover:bg-rose-500 hover:text-white hover:cursor-pointer"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                        </div>

                        {#if item.category && activeCategory === 'all'}
                            <button onclick={(e) => { e.stopPropagation(); onOpenGroup(item.category)}} class="absolute left-3 top-3 z-10 rounded-lg bg-black/60 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur transition hover:scale-105">{item.category}</button>
                        {/if}

                        {#if item.metadata?.image}
                            <img src={item.metadata.image} alt="" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                        {:else}
                            <div class="flex h-full items-center justify-center text-slate-300"><svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                        {/if}
                    </div>

                    <div class="flex flex-1 flex-col p-4 sm:p-5">
                        <h3 class="text-base font-bold leading-snug text-slate-900 line-clamp-2 group-hover:text-purple-600">{item.metadata?.title ?? 'Tanpa Judul'}</h3>
                        <p class="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{item.metadata?.description ?? 'Deskripsi tidak tersedia.'}</p>
                        
                        <!-- <div class="mt-auto pt-4">
                            <a href={item.url} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-purple-600 hover:text-purple-800">
                                Kunjungi Tautan <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </a>
                        </div> -->
                    </div>
                </article>

            {:else}
                <article onclick={() => window.open(item.url, "_blank")} class=" hover:scale-[0.99] group relative flex h-28 sm:h-36 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-purple-200 hover:cursor-pointer">
                    <div class="relative w-28 shrink-0 bg-slate-100 sm:w-48 overflow-hidden">
                        {#if item.category && activeCategory === 'all'}
                            <button onclick={(e) => { e.stopPropagation(); onOpenGroup(item.category)}} class="absolute left-2 top-2 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur sm:left-3 sm:top-3 sm:px-2 sm:py-1 sm:text-[9px]">{item.category}</button>
                        {/if}

                        {#if item.metadata?.image}
                            <img src={item.metadata.image} alt="" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                        {:else}
                            <div class="flex h-full items-center justify-center text-slate-300"><svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                        {/if}
                    </div>

                    <div class="flex flex-1 flex-col justify-between p-3 sm:p-5">
                        <div class="pr-8 sm:pr-24">
                            <h3 class="text-sm font-bold leading-snug text-slate-900 line-clamp-1 sm:line-clamp-2 sm:text-lg group-hover:text-purple-600">{item.metadata?.title ?? 'Tanpa Judul'}</h3>
                            <p class="mt-1 line-clamp-1 text-[10px] text-slate-500 sm:mt-1.5 sm:line-clamp-2 sm:text-xs">{item.metadata?.description ?? 'Deskripsi tidak tersedia.'}</p>
                        </div>
                        
                        <!-- <div class="flex items-center justify-between">
                            <a href={item.url} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-purple-600 hover:text-purple-800 sm:gap-1.5 sm:text-xs">
                                Buka <span class="hidden sm:inline">Tautan</span> <svg class="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </a>
                        </div> -->
                    </div>

                    <div class="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col gap-1 sm:right-4 sm:flex-row sm:gap-2">
                        <button onclick={(e) => { e.stopPropagation(); onMobileMenu(item)}} class="rounded-full bg-slate-50 p-1.5 text-slate-500 hover:bg-slate-200 sm:hidden"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2.5" /><circle cx="12" cy="12" r="2.5" /><circle cx="12" cy="19" r="2.5" /></svg></button>
                        <div class="hidden sm:flex sm:gap-1.5">
                            <button onclick={(e) => { e.stopPropagation(); onEdit(item.id)}} class="z[100] rounded-full bg-slate-50 p-2 text-slate-500 hover:bg-blue-500 hover:text-white hover:cursor-pointer" title="Edit"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                            <button onclick={(e) => { e.stopPropagation(); onMove(item)}} class="z[100] rounded-full bg-slate-50 p-2 text-slate-500 hover:bg-purple-600 hover:text-white hover:cursor-pointer" title="Pindah"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg></button>
                            <button onclick={(e) => { e.stopPropagation(); onDelete(item.id)}} class="z[100] rounded-full bg-slate-50 p-2 text-slate-500 hover:bg-rose-500 hover:text-white hover:cursor-pointer" title="Hapus"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                    </div>
                </article>
            {/if}

        {/each}
    </div>
{/if}