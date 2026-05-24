export async function GET() {
    const websiteUrl = 'https://ungumark.vercel.app';

    // Daftar halaman publik yang mau didaftarkan ke Google
    const pages = [
        '' // Halaman utama (/)
        // Kalau nanti kamu punya halaman '/about' atau '/features', tambahkan di sini:
        // 'about',
        // 'features'
    ];

    const sitemap = `
        <?xml version="1.0" encoding="UTF-8" ?>
        <urlset
            xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:xhtml="https://www.w3.org/1999/xhtml"
            xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
            xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
            xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
            xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
        >
            ${pages.map((page) => `
                <url>
                    <loc>${websiteUrl}/${page}</loc>
                    <changefreq>daily</changefreq>
                    <priority>${page === '' ? '1.0' : '0.8'}</priority>
                </url>
            `).join('')}
        </urlset>
    `.trim();

    return new Response(sitemap, {
        headers: {
            'Cache-Control': 'max-age=0, s-maxage=3600',
            'Content-Type': 'application/xml'
        }
    });
}