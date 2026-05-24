<script lang="ts">
    let { isOpen = $bindable(false) } = $props<{ isOpen: boolean; }>();

    function closeModal() {
        isOpen = false;
    }
</script>

{#if isOpen}
    <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm transition-all">
        <div class="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-purple-900/10 ring-1 ring-slate-100">
            
            <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4 sm:px-8">
                <h2 class="text-sm font-bold uppercase tracking-widest text-purple-700">Kebijakan Privasi</h2>
                <button onclick={closeModal} class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-500 hover:ring-rose-200">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div class="flex-1 overflow-y-auto p-6 sm:p-8">
                <h3 class="mb-4 text-2xl font-bold text-slate-900">Privasi Anda Aman.</h3>
                <div class="space-y-4 text-sm leading-relaxed text-slate-600">
                    <p>Di UnguMark, keamanan dan privasi data Anda adalah prioritas utama kami. Dokumen ini menjelaskan prinsip dasar pengelolaan data dalam sistem kami.</p>
                    <h4 class="font-bold text-slate-800">1. Data yang Dikumpulkan</h4>
                    <p>Kami hanya menyimpan informasi esensial untuk memfungsikan aplikasi, yakni: alamat email Anda, nama profil, dan tautan/bookmark yang Anda simpan di dalam database kami secara tertutup.</p>
                    <h4 class="font-bold text-slate-800">2. Keamanan Data</h4>
                    <p>Autentikasi dienkripsi dengan standar industri modern. Kami tidak memperjualbelikan data Anda kepada pihak ketiga mana pun. Semua tautan yang Anda simpan murni hanya bisa diakses oleh akun Anda sendiri.</p>
                </div>
            </div>

            <div class="flex justify-end border-t border-slate-100 bg-slate-50/50 p-6 sm:px-8">
                <button onclick={closeModal} class="w-full cursor-pointer rounded-2xl bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-slate-800 sm:w-auto">
                    Saya Mengerti
                </button>
            </div>

        </div>
    </div>
{/if}