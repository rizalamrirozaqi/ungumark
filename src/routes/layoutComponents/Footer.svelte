<script lang="ts">
    import favicon from '$lib/assets/favicon.png';
    let { 
        onOpenPrivacy, 
        onOpenTerms 
    } = $props<{
        onOpenPrivacy: () => void;
        onOpenTerms: () => void;
    }>();
</script>

<footer class="mt-auto w-full border-t border-slate-200/60 bg-white/40 px-4 py-8 backdrop-blur-sm sm:px-8">
    <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        
        <div class="flex items-center gap-2 opacity-80 transition-opacity hover:opacity-100">
            <img src={favicon} alt="UnguMark Logo" class="h-5 w-5 ">
            <span class="font-sans text-sm font-bold text-slate-800">UnguMark<span class="text-purple-600">.</span></span>
        </div>

        <p class="text-center text-xs font-semibold text-slate-400">
            &copy; 2026 Rizal Amri Rozaqi. <span class="hidden sm:inline">All rights reserved.</span>
        </p>

        <div class="flex items-center gap-5 text-xs font-bold uppercase tracking-wider text-slate-400">
            <button onclick={onOpenPrivacy} class="cursor-pointer transition hover:text-purple-600">Privasi</button>
            <button onclick={onOpenTerms} class="cursor-pointer transition hover:text-purple-600">Ketentuan</button>
            <a href="https://instagram.com/rizalamri.rar" target="_blank" rel="noopener noreferrer" class="transition hover:text-purple-600">
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-4 w-4" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
            </a>
            <a href="mailto:rizalamrirozaqi@gmail.com" class="transition hover:text-purple-600">
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-4 w-4" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
            </a>
        </div>
        
    </div>
</footer>