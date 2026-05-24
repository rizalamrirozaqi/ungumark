// src/lib/actions/portal.js
export function portal(node) {
    // Saat modal terbuka, fungsi ini bakal nyomot elemen HTML-nya...
    const body = document.body;

    // ...dan menempelkannya paksa sebagai anak langsung dari <body>
    // Biar dia terbebas dari container manapun yang punya transform CSS.
    body.appendChild(node);

    return {
        destroy() {
            // Saat modal tertutup ({#if isOpen} jadi false), Svelte bakal
            // memanggil fungsi ini buat menghapus elemennya dari <body>.
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
        }
    };
}