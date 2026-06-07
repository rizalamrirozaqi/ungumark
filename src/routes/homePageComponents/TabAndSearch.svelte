<script lang="ts">
    let { 
        viewMode = $bindable(), 
        activeCategory = $bindable(), 
        q = $bindable(),
        layoutMode = $bindable(),
        onCreateNew
    } = $props<{
        viewMode: 'links' | 'groups';
        activeCategory: string;
        q: string;
        layoutMode: 'grid' | 'list';
        onCreateNew: () => void;
    }>();
</script>

<div class="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
    <div class="hidden lg:inline-flex justify-between rounded-full bg-slate-200/50 p-1.5 shadow-inner ">
        <button
            onclick={() => { viewMode = 'links'; activeCategory = 'all'; }}
            class="rounded-full px-6 py-2.5 hover:cursor-pointer text-sm font-bold transition-all {viewMode === 'links' && activeCategory === 'all' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}"
        >
            Semua Tautan - すべてのリンク
        </button>
        <button
            onclick={() => { viewMode = 'groups'; }}
            class="rounded-full px-6 py-2.5 hover:cursor-pointer text-sm font-bold transition-all {viewMode === 'groups' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}"
        >
            Koleksi Grup - グループコレクション
        </button>
    </div>

    <div class="inline-flex lg:hidden justify-between rounded-full bg-slate-200/50 p-1.5 shadow-inner ">
        <button
            onclick={() => { viewMode = 'links'; activeCategory = 'all'; }}
            class="w-full rounded-full px-6 py-2.5 hover:cursor-pointer text-sm font-bold transition-all whitespace-nowrap {viewMode === 'links' && activeCategory === 'all' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}"
        >
            Semua Tautan
        </button>
        <button
            onclick={() => { viewMode = 'groups'; }}
            class="w-full rounded-full px-6 py-2.5 hover:cursor-pointer text-sm font-bold transition-all {viewMode === 'groups' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}"
        >
            Koleksi Grup
        </button>
    </div>

    <div class="flex flex-row gap-2">
        {#if viewMode === 'links'}
            <form class="w-full sm:w-80" method="GET" action="." onsubmit={(e) => e.preventDefault()}>
                <label class="relative block">
                    <svg class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors peer-focus:text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        class="peer w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-purple-300 focus:shadow-[0_0_0_4px_rgba(147,51,234,0.1)]"
                        name="q"
                        placeholder="Cari dalam arsip..."
                        bind:value={q}
                    />
                </label>
            </form>
        {/if}
    
        {#if viewMode === 'groups'}
            <div class="w-full sm:w-80 justify-end inline-flex">
                <button 
                    onclick={onCreateNew}
                    class="inline-flex items-center gap-2 rounded-2xl bg-purple-100 px-5 py-3 text-sm font-bold text-purple-700 transition-all hover:bg-purple-200 hover:scale-105 hover:cursor-pointer"
                >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Buat Grup Baru
                </button>
            </div>
        {/if}
    
        <div class="hidden items-center rounded-full bg-slate-200/50 p-1 shadow-inner sm:flex">
            <button 
                onclick={() => layoutMode = 'grid'} 
                class="rounded-full p-2 transition-all {layoutMode === 'grid' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-700 hover:cursor-pointer'}"
                aria-label="Tampilan Grid"
            >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button 
                onclick={() => layoutMode = 'list'} 
                class="rounded-full p-2 transition-all {layoutMode === 'list' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-700 hover:cursor-pointer'}"
                aria-label="Tampilan List"
            >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
        </div>
    </div>
    
</div>