export async function fetchUrlMetadata(targetUrl: string) {
    try {
        const parsedUrl = new URL(targetUrl);
        const hostname = parsedUrl.hostname;

        // 1. JALUR YOUTUBE (Tetap pakai oEmbed bawaan karena lebih ngebut)
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
            let videoUrl = targetUrl;
            if (hostname === 'music.youtube.com') {
                videoUrl = targetUrl.replace('music.youtube.com', 'www.youtube.com');
            }
            const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`);
            if (response.ok) {
                const data = await response.json();
                return {
                    title: data.title,
                    description: `Channel: ${data.author_name}`, 
                    image: data.thumbnail_url,
                    url: targetUrl
                };
            }
        }

        // 2. JALUR INSTAGRAM, TIKTOK, & TWITTER (Lempar ke calo Microlink)
        if (hostname.includes('instagram.com') || hostname.includes('tiktok.com') || hostname.includes('x.com') || hostname.includes('twitter.com')) {
            
            // Panggil API Microlink
            const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}`;
            const response = await fetch(microlinkUrl);
            
            if (response.ok) {
                const json = await response.json();
                const data = json.data;
                
                return {
                    // Microlink sangat pintar, kalau gak ada judul, dia ambil author
                    title: data.title || data.author || 'Postingan Sosial Media',
                    description: data.description || 'Deskripsi tidak tersedia.',
                    // Ambil URL gambar dari object image milik microlink
                    image: data.image?.url || data.logo?.url || '',
                    url: targetUrl
                };
            }
        }

        // 3. JALUR WEBSITE BIASA LAINNYA (Fallback)
        return {
            title: "Tautan Tersimpan",
            description: "Deskripsi belum tersedia.",
            image: "",
            url: targetUrl
        };

    } catch (error) {
        console.error("Gagal nge-fetch data:", error);
        return {
            title: "Gagal memuat metadata",
            description: "",
            image: "",
            url: targetUrl
        };
    }
}