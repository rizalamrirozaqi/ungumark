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
                <h2 class="text-sm font-bold uppercase tracking-widest text-purple-700">Ketentuan Layanan</h2>
                <button onclick={closeModal} class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-500 hover:ring-rose-200">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div class="flex-1 overflow-y-auto p-6 sm:p-8">
                <h3 class="mb-4 text-2xl font-bold text-slate-900">Aturan Main UnguMark</h3>
                <div class="space-y-4 text-sm leading-relaxed text-slate-600">
                    <p>Dengan mengakses dan menggunakan UnguMark, Anda menyetujui seluruh ketentuan layanan berikut ini:</p>
                    <h4 class="font-bold text-slate-800">1. Penggunaan Layanan</h4>
                    <p>Aplikasi ini dibangun untuk keperluan manajemen arsip personal. Anda bertanggung jawab penuh atas segala bentuk tautan (URL) yang Anda masukkan dan simpan di dalam ruang kerja Anda.</p>
                    <h4 class="font-bold text-slate-800">2. Penyalahgunaan</h4>
                    <p>Kami berhak menangguhkan atau menghapus akun yang terbukti menyalahgunakan platform untuk kegiatan ilegal, spamming, penyerangan siber, atau eksploitasi infrastruktur server aplikasi ini secara berlebihan.</p>
                </div>
            </div>

            <div class="flex justify-end border-t border-slate-100 bg-slate-50/50 p-6 sm:px-8">
                <button onclick={closeModal} class="w-full cursor-pointer rounded-2xl bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-slate-800 sm:w-auto">
                    Setuju & Lanjutkan
                </button>
            </div>

        </div>
    </div>
{/if}