<script lang="ts">
    import { useSession } from '$lib/auth-client';
    import favicon from '$lib/assets/favicon.png';
    
    let { onOpenProfile } = $props<{
        onOpenProfile: () => void;
    }>();

    const session = useSession();
</script>

<div class="sticky top-4 z-40 px-4">
    <nav class="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/40 bg-white/70 px-5 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
        
        <a href="/" class="group flex items-center gap-2.5 font-sans text-lg font-bold tracking-tight text-slate-800 transition hover:text-purple-600">
            <img src={favicon} alt="UnguMark Logo" class="h-6 w-6 ">
            <!-- <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-sm transition group-hover:scale-105">
            </div> -->
            <span>UnguMark<span class="text-purple-600">.</span></span>
        </a>

        <div class="flex items-center gap-3">
            {#if $session.data?.user}
                <div class="flex items-center gap-1 sm:gap-2">
                    
                    <div class="flex items-center gap-2.5 pr-2 sm:pr-4 hover:cursor-pointer" onclick={onOpenProfile} onkeydown={(e) => e.key === 'Enter' && onOpenProfile()} tabindex="0" role="button">
                        {#if $session.data.user.image}
                            <img src={$session.data.user.image} alt="Avatar" class="h-8 w-8 rounded-full object-cover ring-2 ring-purple-100" />
                        {:else}
                            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700 ring-1 ring-purple-200">
                                {($session.data.user.name || $session.data.user.email || '?')[0].toUpperCase()}
                            </div>
                        {/if}
                        <span class="hidden text-sm font-semibold text-slate-700 sm:block">
                            {$session.data.user.name || 'User'}
                        </span>
                    </div>


                </div>
            {:else if !$session.isPending}
                <a href="/sign-in" class="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
                    Masuk
                </a>
                <a href="/sign-up" class="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
                    Daftar
                </a>
            {/if}
        </div>
    </nav>
</div>