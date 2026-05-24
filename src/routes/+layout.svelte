<script lang="ts">
    import favicon from '$lib/assets/favicon.svg';
    import '../app.css';

    import Navbar from './layoutComponents/Navbar.svelte';
    import Footer from './layoutComponents/Footer.svelte';
    import ProfileModal from './layoutComponents/ProfileModal.svelte';
    import PrivasiModal from './layoutComponents/PrivasiModal.svelte';
    import KetentuanModal from './layoutComponents/KetentuanModal.svelte';

    let { children } = $props();

    // State Pengaturan Modal Global
    let isProfileModalOpen = $state(false);
    let isPrivacyModalOpen = $state(false);
    let isTermsModalOpen = $state(false);

    function openProfileModal() {
        isProfileModalOpen = true;
    }
</script>

<svelte:head>
    <title>UnguMark - Smart Bookmark Manager</title>
    
    <meta name="description" content="Simpan, atur, dan kelola semua link bookmark kamu dengan mudah dan cepat menggunakan UnguMark." />
    
    <meta name="keywords" content="bookmark manager, simpan link, sveltekit bookmark, ungumark" />
    <link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col bg-[#f8fafc] font-sans text-slate-900 selection:bg-purple-500 selection:text-white">
    
    <Navbar onOpenProfile={openProfileModal} />

    <div class="flex-1">
        {@render children()}
    </div>

    <Footer 
        onOpenPrivacy={() => isPrivacyModalOpen = true} 
        onOpenTerms={() => isTermsModalOpen = true} 
    />

    <ProfileModal bind:isOpen={isProfileModalOpen} />
    <PrivasiModal bind:isOpen={isPrivacyModalOpen} />
    <KetentuanModal bind:isOpen={isTermsModalOpen} />
    
</div>