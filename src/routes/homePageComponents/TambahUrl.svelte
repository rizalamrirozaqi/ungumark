<script lang="ts">
    let { 
        inputUrl = $bindable(), 
        selectedGroup = $bindable(), 
        manualGroups, 
        isLoading, 
        onSubmit,
        onCreateNew
    } = $props<{
        inputUrl: string;
        selectedGroup: string;
        manualGroups: string[];
        isLoading: boolean;
        onSubmit: (e: SubmitEvent) => void;
        onCreateNew: () => void;
    }>();

    // State untuk mengontrol buka/tutup dropdown custom
    let isDropdownOpen = $state(false);

    function selectGroup(group: string) {
        selectedGroup = group;
        isDropdownOpen = false;
    }

    function handleCreateNew() {
        isDropdownOpen = false;
        onCreateNew();
    }
</script>

{#if isDropdownOpen}
    <div class="fixed inset-0 z-40" onclick={() => isDropdownOpen = false}></div>
{/if}

<form class="mx-auto flex max-w-4xl flex-col gap-3 rounded-[2rem] bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100 transition-all focus-within:shadow-[0_8px_40px_rgba(147,51,234,0.08)] focus-within:ring-purple-200 sm:flex-row" onsubmit={onSubmit}>
    <div class="flex flex-1 flex-col gap-2 px-4 sm:flex-row">
        
        <label class="flex-1 py-3">
            <span class="sr-only">Tautan (URL)</span>
            <input
                class="w-full bg-transparent text-base text-slate-900 outline-none transition placeholder:text-slate-400"
                placeholder="Tempel tautan Anda di sini..."
                autocomplete="off"
                inputmode="url"
                bind:value={inputUrl}
                required
            />
        </label>
        
        <div class="my-2 hidden w-px bg-slate-100 sm:block"></div>
        
        <div class="relative flex items-center py-3 sm:w-64">
            <button
                type="button"
                onclick={() => isDropdownOpen = !isDropdownOpen}
                class="flex w-full items-center justify-between bg-transparent hover:cursor-pointer text-base font-medium outline-none transition-colors {selectedGroup ? 'text-purple-700 font-semibold' : 'text-slate-500'}"
            >
                <span class="truncate">{selectedGroup || 'Tanpa Grup'}</span>
                <svg class="h-5 w-5 text-slate-400 transition-transform duration-300 {isDropdownOpen ? 'rotate-180 text-purple-600' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {#if isDropdownOpen}
                <div class="absolute right-0 top-[110%] z-50 mt-2 w-full min-w-[240px] origin-top overflow-hidden rounded-3xl bg-white shadow-2xl shadow-purple-900/10 ring-1 ring-slate-100 transition-all">
                    
                    <div class="max-h-56 overflow-y-auto p-2">
                        <button
                            type="button"
                            onclick={() => selectGroup('')}
                            class="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all {selectedGroup === '' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}"
                        >
                            <span>Tanpa Grup</span>
                            {#if selectedGroup === ''}
                                <svg class="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
                            {/if}
                        </button>
                        
                        {#each manualGroups as g}
                            <button
                                type="button"
                                onclick={() => selectGroup(g)}
                                class="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all {selectedGroup === g ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}"
                            >
                                <span class="truncate">{g}</span>
                                {#if selectedGroup === g}
                                    <svg class="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
                                {/if}
                            </button>
                        {/each}
                    </div>
                    
                    <div class="border-t border-slate-100 bg-slate-50/50 p-2">
                        <button 
                            type="button"
                            onclick={handleCreateNew}
                            class="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-purple-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-purple-50 hover:ring-purple-300"
                        >
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                            Buat Grup Baru
                        </button>
                    </div>

                </div>
            {/if}
        </div>

    </div>

    <button
        class="flex h-14 items-center hover:cursor-pointer justify-center rounded-3xl bg-purple-600 px-8 text-sm font-bold tracking-wide text-white shadow-lg shadow-purple-600/20 transition-all hover:bg-purple-700 hover:shadow-purple-600/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none sm:w-auto"
        disabled={isLoading || !inputUrl.trim()}
        type="submit"
    >
        {isLoading ? 'Menyimpan...' : 'Tambahkan'}
    </button>
</form>