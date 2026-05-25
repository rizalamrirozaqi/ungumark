export async function fetchUrlMetadata(targetUrl: string) {
    try {
        // 1. OBAT ANTI-CRASH: Pastikan URL ada http/https-nya
        let validUrl = targetUrl.trim();
        if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
            validUrl = 'https://' + validUrl;
        }

        // Cek apakah URL valid
        const parsedUrl = new URL(validUrl);
        const hostname = parsedUrl.hostname;

        // 2. JALUR UTAMA: Serahkan semuanya ke Microlink
        // Microlink otomatis ngikutin s.id / bit.ly sampai ke tujuan akhir!
        try {
            const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(validUrl)}`;
            const response = await fetch(microlinkUrl);
            
            if (response.ok) {
                const json = await response.json();
                const data = json.data;
                
                return {
                    title: data.title || data.author || 'Tautan Tersimpan',
                    description: data.description || 'Deskripsi tidak tersedia.',
                    image: data.image?.url || data.logo?.url || '',
                    // Kerennya Microlink: data.url berisi alamat asli tujuan akhirnya!
                    url: data.url || validUrl 
                };
            }
        } catch (microErr) {
            console.log("Microlink gagal, coba jalur manual...");
        }

        // 3. JALUR MANUAL YOUTUBE (Kalau Microlink lagi error/limit)
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
            let videoUrl = validUrl;
            if (hostname === 'music.youtube.com') {
                videoUrl = validUrl.replace('music.youtube.com', 'www.youtube.com');
            }
            const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`);
            if (response.ok) {
                const data = await response.json();
                return {
                    title: data.title,
                    description: `Channel: ${data.author_name}`, 
                    image: data.thumbnail_url,
                    url: validUrl
                };
            }
        }

        // 4. FALLBACK TERAKHIR
        return {
            title: "Tautan Tersimpan",
            description: "Akses ke detail website dibatasi oleh server.",
            image: "",
            url: validUrl
        };

    } catch (error) {
        // Nah, coba perhatikan Terminal VS Code kamu kalau masih gagal!
        console.error("====== GAGAL NGE-FETCH ======");
        console.error("URL:", targetUrl);
        console.error("Pesan Error:", error);
        
        return {
            title: "Gagal memuat metadata",
            description: "Coba edit judul dan deskripsi secara manual.",
            image: "",
            url: targetUrl
        };
    }
}