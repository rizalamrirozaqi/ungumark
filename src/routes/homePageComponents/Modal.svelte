<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { portal } from '$lib/actions/portal';

    let { modal = $bindable() } = $props<{
        modal: any;
    }>();
</script>

{#if modal.isOpen}
    <div 
        use:portal
        transition:fade={{ duration: 150 }}
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4" 
        style="will-change: opacity;"
        onclick={modal.onCancel}
    >
        <div 
            transition:fly={{ y: 20, duration: 250, opacity: 1 }}
            class="w-full max-w-md overflow-hidden rounded-[2rem] bg-white p-6 shadow-2xl ring-1 ring-slate-100 sm:p-8" 
            style="will-change: transform, opacity;"
            onclick={(e) => e.stopPropagation()}
        >
            
            {#if modal.type === 'options'}
                <div class="flex flex-col gap-1">
                    <h3 class="mb-3 px-2 text-lg font-bold text-slate-900">Pilih Aksi</h3>
                    
                    {#each modal.options as opt}
                        <button 
                            onclick={() => modal.onConfirm(opt.value)} 
                            class="flex w-full cursor-pointer items-center justify-start rounded-xl bg-transparent px-4 py-3.5 text-left text-sm font-semibold transition hover:bg-slate-50 active:bg-slate-100 {opt.color || 'text-slate-700 hover:text-purple-600'}"
                        >
                            {opt.label}
                        </button>
                    {/each}
                </div>

                <div class="mt-4 flex justify-end">
                    <button 
                        onclick={modal.onCancel} 
                        class="cursor-pointer rounded-xl px-6 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                        Batal
                    </button>
                </div>

            {:else}
                <div class="mb-6 flex items-center gap-4">
                    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full {modal.type === 'alert' ? 'bg-red-50 text-red-500' : 'bg-purple-50 text-purple-600'}">
                        {#if modal.type === 'alert'}
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        {:else if modal.type === 'prompt' || modal.type === 'edit-meta'}
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        {:else}
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {/if}
                    </div>
                    <h3 class="text-xl font-bold text-slate-900">{modal.title}</h3>
                </div>
                
                <p class="mb-8 whitespace-pre-wrap text-base leading-relaxed text-slate-600">{modal.message}</p>
                
                {#if modal.type === 'prompt'}
                    <input 
                        type="text" 
                        class="mb-8 w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-base font-semibold text-slate-900 outline-none ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-2 focus:ring-purple-500"
                        placeholder={modal.placeholder}
                        bind:value={modal.inputValue}
                        onkeydown={(e) => e.key === 'Enter' && modal.onConfirm(modal.inputValue)}
                        autofocus
                    />
                
                {:else if modal.type === 'select'}
                    <div class="mb-8 flex max-h-56 flex-col gap-2 overflow-y-auto px-1">
                        {#each modal.options as opt}
                            <button
                                type="button"
                                onclick={() => modal.onConfirm(opt.value)}
                                class="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left text-base font-semibold text-slate-600 transition-all hover:border-purple-300 hover:bg-white active:bg-purple-50"
                            >
                                <span>{opt.label}</span>
                            </button>
                        {/each}
                    </div>
                
                {:else if modal.type === 'edit-meta'}
                    <div class="mt-4 flex flex-col gap-4 text-left">
                        <label class="flex flex-col gap-1.5">
                            <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Judul Tautan</span>
                            <input 
                                type="text" 
                                bind:value={modal.editData.title} 
                                class="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-purple-500"
                                placeholder="Masukkan judul..."
                            />
                        </label>
                        <label class="flex flex-col gap-1.5">
                            <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">Deskripsi</span>
                            <textarea 
                                bind:value={modal.editData.description} 
                                class="w-full resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-purple-500"
                                placeholder="Masukkan deskripsi..."
                                rows="3"
                            ></textarea>
                        </label>
                    </div>

                    <div class="mt-8 flex gap-3">
                        <button onclick={modal.onCancel} class="w-full cursor-pointer rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200">
                            Batal
                        </button>
                        <button onclick={() => modal.onConfirmEdit(modal.editData)} class="w-full cursor-pointer rounded-2xl bg-purple-600 py-3.5 text-sm font-bold text-white shadow-md shadow-purple-600/20 transition hover:-translate-y-0.5 hover:bg-purple-700">
                            Simpan
                        </button>
                    </div>
                {/if}

                {#if modal.type !== 'edit-meta' && modal.type !== 'select'}
                    <div class="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                        {#if modal.type !== 'alert'}
                            <button 
                                onclick={modal.onCancel}
                                class="cursor-pointer rounded-2xl px-6 py-3.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                                Batal
                            </button>
                        {/if}
                        <button 
                            onclick={() => modal.onConfirm(modal.inputValue)}
                            class="w-full cursor-pointer rounded-2xl {modal.type === 'alert' ? 'bg-slate-900' : 'bg-purple-600'} px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 sm:w-auto {modal.type === 'alert' ? 'hover:bg-slate-800' : 'shadow-purple-600/20 hover:bg-purple-700 hover:shadow-purple-600/30'}"
                        >
                            {modal.type === 'alert' ? 'Mengerti' : 'Konfirmasi'}
                        </button>
                    </div>
                {/if}
            {/if}
            
        </div>
    </div>
{/if}