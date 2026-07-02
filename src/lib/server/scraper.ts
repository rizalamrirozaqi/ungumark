import FallbackImage from "$lib/assets/default-fallback-image.png";
import * as cheerio from 'cheerio'; // Pastikan cheerio di-import

export async function fetchUrlMetadata(targetUrl: string) {
    try {
        let validUrl = targetUrl.trim();
        if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
            validUrl = 'https://' + validUrl;
        }

        const parsedUrl = new URL(validUrl);
        const hostname = parsedUrl.hostname;

        // YOUTUBE OEMBED
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
            let videoUrl = validUrl;
            if (hostname === 'music.youtube.com') {
                videoUrl = validUrl.replace('music.youtube.com', 'www.youtube.com');
            }
            try {
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
            } catch (err) {
                console.log("YouTube oEmbed gagal, lanjut ke Microlink...");
            }
        }

        // MICROLINK API (Jika bukan YouTube atau YouTube gagal)
        try {
            const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(validUrl)}`;
            const response = await fetch(microlinkUrl);
            
            if (response.ok) {
                const json = await response.json();
                const data = json.data;
                
                return {
                    title: data.title || data.author || 'Tautan Tersimpan',
                    description: data.description || 'Deskripsi tidak tersedia.',
                    image: data.image?.url || data.logo?.url || FallbackImage,
                    url: data.url || validUrl 
                };
            }
        } catch (microErr) {
            console.log("Microlink gagal, coba jalur manual dengan Cheerio...");
        }

        // CHEERIO
        try {
            const htmlResponse = await fetch(validUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            
            if (htmlResponse.ok) {
                const html = await htmlResponse.text();
                const $ = cheerio.load(html);
                
                const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Tautan Tersimpan';
                const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || 'Deskripsi tidak tersedia.';
                const image = $('meta[property="og:image"]').attr('content') || FallbackImage;

                return {
                    title,
                    description,
                    image,
                    url: validUrl
                };
            }
        } catch (cheerioErr) {
            console.log("Cheerio gagal melakukan ekstraksi manual.");
        }

        // 4. FALLBACK TERAKHIR (Penyelamatan tata letak UI)
        return {
            title: "Tautan Tersimpan",
            description: "Akses ke detail website dibatasi oleh server.",
            image: FallbackImage, // 🔥 Hapus kurung kurawal agar menjadi string murni
            url: validUrl
        };

    } catch (error) {
        console.error("====== GAGAL NGE-FETCH ======");
        console.error("URL:", targetUrl);
        console.error("Pesan Error:", error);
        
        return {
            title: "Gagal memuat metadata",
            description: "Coba edit judul dan deskripsi secara manual.",
            image: FallbackImage, // Sebaiknya gunakan gambar default juga di sini
            url: targetUrl
        };
    }
}