import { browser } from '$app/environment';

type ApiMetadata = {
    title: string | null;
    description: string | null;
    image: string | null;
    fetchedAt: string | number | null;
};

export type ApiResult = {
    id: string;
    url: string;
    category?: string | null;
    metadata: ApiMetadata | null;
};

export class BookmarkStore {
    // State Global
    inputUrl = $state('');
    selectedGroup = $state('');
    isLoading = $state(false);
    error = $state<string | null>(null);
    items = $state<ApiResult[]>([]);
    q = $state('');
    activeCategory = $state<string | 'all'>('all');
    viewMode = $state<'links' | 'groups'>('links');
    layoutMode = $state<'grid' | 'list'>('grid');
    manualGroups = $state<string[]>([]);

    // Modal State
    modal = $state({
        isOpen: false,
        type: 'alert' as 'alert' | 'confirm' | 'prompt' | 'select' | 'edit-meta' | 'options', 
        title: '',
        message: '',
        inputValue: '',
        placeholder: '',
        options: [] as { value: string; label: string }[],
        
        // State khusus untuk menampung form multi-input
        editData: { title: '', description: '' }, 
        
        onConfirm: (val?: string) => {},
        onConfirmEdit: (data: { title: string; description: string }) => {}, // Handler khusus edit
        onCancel: () => {}
    });

    constructor() {
        this.fetchGroups();
    }

    // ==========================================
    // DERIVED (Computed Value)
    // ==========================================
    get filteredItems() {
        return this.items.filter((item) => {
            const qq = this.q.trim().toLowerCase();
            const hay = `${item.url}\n${item.metadata?.title ?? ''}\n${item.category ?? ''}\n${item.metadata?.description ?? ''}`.toLowerCase();
            const matchesSearch = !qq || hay.includes(qq);
            const matchesCat = this.activeCategory === 'all' || item.category === this.activeCategory;
            return matchesSearch && matchesCat;
        });
    }

    // ==========================================
    // MODAL METHODS
    // ==========================================
    closeModal = () => {
        this.modal.isOpen = false;
        this.modal.inputValue = '';
    };

    showAlert = (title: string, message: string) => {
        this.modal = { ...this.modal, isOpen: true, type: 'alert', title, message, onConfirm: this.closeModal };
    };

    showConfirm = (title: string, message: string, onConfirm: () => void) => {
        this.modal = {
            ...this.modal, isOpen: true, type: 'confirm', title, message,
            onConfirm: () => { onConfirm(); this.closeModal(); },
            onCancel: this.closeModal
        };
    };

    showPrompt = (title: string, message: string, placeholder: string, defaultValue: string, onConfirm: (val: string) => void) => {
        this.modal = {
            ...this.modal, isOpen: true, type: 'prompt', title, message, placeholder, inputValue: defaultValue,
            onConfirm: (val) => { onConfirm(val || ''); this.closeModal(); },
            onCancel: this.closeModal
        };
    };

    showSelect = (title: string, message: string, options: { value: string; label: string }[], defaultValue: string, onConfirm: (val: string) => void) => {
        this.modal = {
            ...this.modal, isOpen: true, type: 'select', title, message, options, inputValue: defaultValue,
            onConfirm: (val) => { onConfirm(val || ''); this.closeModal(); },
            onCancel: this.closeModal
        };
    };

    showEditMeta = (title: string, description: string, onConfirm: (data: { title: string; description: string }) => void) => {
        this.modal = {
            ...this.modal, 
            isOpen: true, 
            type: 'edit-meta', 
            title: 'Edit Detail Tautan', 
            message: 'Ubah judul dan deskripsi tautan di bawah ini.',
            editData: { title: title || '', description: description || '' },
            onConfirmEdit: (data) => { onConfirm(data); this.closeModal(); },
            onCancel: this.closeModal
        };
    };

    // ==========================================
    // BUSINESS LOGIC & API
    // ==========================================
    editMetadata = (id: string) => {
        const item = this.items.find(i => i.id === id);
        if (!item) return;

        this.showEditMeta(
            item.metadata?.title || '',
            item.metadata?.description || '',
            async (newData) => {
                // Optimistic UI Update: Langsung ubah di layar tanpa nunggu loading server
                const previousItems = this.items;
                this.items = this.items.map(i => i.id === id ? { 
                    ...i, 
                    metadata: i.metadata 
                        ? { ...i.metadata, title: newData.title, description: newData.description }
                        : { title: newData.title, description: newData.description, image: null, fetchedAt: null }
                } : i);

                try {
                    const res = await fetch(`/api/metadata/${id}`, {
                        method: 'PATCH',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify(newData)
                    });
                    if (!res.ok) throw new Error('Gagal');
                } catch (err) {
                    // Kalau server gagal/error, kembalikan data ke versi sebelumnya (Revert)
                    this.items = previousItems;
                    setTimeout(() => this.showAlert('Gagal', 'Terjadi kesalahan jaringan saat menyimpan.'), 200);
                }
            }
        );
    };

    fetchGroups = async () => {

        if(!browser) return;

        try {
            const res = await fetch('/api/groups');
            if (res.ok) {
                const data = await res.json();
                this.manualGroups = data.map((g: { name: string }) => g.name);
            }
        } catch (e) {
            console.error("Gagal load grup", e);
        }
    };

    createNewGroup = () => {
        this.showPrompt('Buat Grup Baru', 'Masukkan nama grup:', 'Cth: Skripsi', '', async (cleanName) => {
            cleanName = cleanName.trim();
            if (!cleanName) return;
            if (this.manualGroups.includes(cleanName)) {
                setTimeout(() => this.showAlert('Oops!', 'Grup dengan nama ini sudah ada.'), 200);
                return;
            }
            this.manualGroups = [...this.manualGroups, cleanName];
            await fetch('/api/groups', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ name: cleanName })
            });
        });
    };

    promptRenameGroup = (oldName: string, e: Event) => {
        e.stopPropagation();
        this.showPrompt('Ubah Nama', `Masukkan nama baru untuk grup "${oldName}":`, '', oldName, async (newName) => {
            newName = newName.trim();
            if (!newName) return;
            if (this.manualGroups.includes(newName) && newName !== oldName) {
                setTimeout(() => this.showAlert('Oops!', 'Grup sudah ada.'), 200);
                return;
            }

            this.manualGroups = this.manualGroups.map(g => g === oldName ? newName : g);
            if (this.activeCategory === oldName) this.activeCategory = newName;
            this.items = this.items.map(item => item.category === oldName ? { ...item, category: newName } : item);

            await fetch(`/api/groups/${oldName}`, {
                method: 'PATCH',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });
        });
    };

    promptMoveItem = (item: ApiResult) => {
        const selectOptions = [
            { value: '', label: 'Tanpa Grup' },
            ...this.manualGroups.map(g => ({ value: g, label: g }))
        ];

        this.showSelect('Pindahkan Tautan', `Pilih grup tujuan:`, selectOptions, item.category || '', async (target) => {
            const newGroup = target.trim() || null;
            const previousItems = this.items;
            this.items = this.items.map(i => i.id === item.id ? { ...i, category: newGroup } : i);
            try {
                await fetch(`/api/urls/${item.id}/group`, {
                    method: 'PATCH',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ groupId: newGroup })
                });
            } catch (err) {
                this.items = previousItems;
                setTimeout(() => this.showAlert('Gagal', 'Terjadi kesalahan.'), 200);
            }
        });
    };

    deleteGroup = (name: string, e: Event) => {
        e.stopPropagation();
        this.showConfirm('Hapus Grup', `Yakin menghapus grup "${name}"?`, async () => {
            this.manualGroups = this.manualGroups.filter(g => g !== name);
            if (this.activeCategory === name) {
                this.activeCategory = 'all';
                this.viewMode = 'groups';
            }
            this.items = this.items.map(item => item.category === name ? { ...item, category: null } : item);

            await fetch('/api/groups', {
                method: 'DELETE',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ name })
            });
        });
    };

    handleDeleteItem = (id: string) => {
        this.showConfirm('Hapus Arsip', 'Yakin ingin menghapus tautan selamanya?', async () => {
            const previousItems = this.items;
            this.items = this.items.filter(item => item.id !== id);
            try {
                const res = await fetch('/api/metadata', {
                    method: 'DELETE',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ id })
                });
                if (!res.ok) throw new Error('Gagal');
                await this.fetchGroups();
            } catch (err) {
                this.items = previousItems;
                setTimeout(() => this.showAlert('Gagal', 'Terjadi kesalahan.'), 200);
            }
        });
    };

    onSubmit = async (e: SubmitEvent | Event) => {
        if (e) e.preventDefault();
        this.error = null;
        this.isLoading = true;
        try {
            const res = await fetch('/api/metadata', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ url: this.inputUrl, category: this.selectedGroup || null })
            });
            const json = (await res.json()) as ApiResult | { error?: string };
            if (!res.ok) throw new Error(('error' in json && json.error) || 'Request failed');

            this.items = [json as ApiResult, ...this.items.filter((x) => x.id !== (json as ApiResult).id)];
            this.inputUrl = '';
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            this.error = errorMsg;
            // 🔥 TAMBAHIN BARIS INI: Biar kalau Duplicate/Error, muncul Popup!
            setTimeout(() => this.showAlert('Gagal', errorMsg), 200);
        } finally {
            this.isLoading = false;
        }
    };

    openGroup = (groupName: string) => {
        this.activeCategory = groupName;
        this.viewMode = 'links';
        this.q = '';

        // Trik: Bikin riwayat "halaman palsu" biar tombol Back HP bisa dipencet
        if (typeof window !== 'undefined') {
            window.history.pushState({ isInsideGroup: true }, '');
        }
    };

    showOptions = (options: { value: string; label: string; color?: string }[], onSelect: (val: string) => void) => {
        this.modal = {
            ...this.modal, 
            isOpen: true, 
            type: 'options',
            options,
            onConfirm: (val) => { onSelect(val || ''); this.closeModal(); },
            onCancel: this.closeModal
        };
    };

    handleMobileMenu = (item: any) => {
        this.showOptions(
            [
                { value: 'edit', label: 'Edit', color: 'text-slate-700' },
                { value: 'move', label: 'Pindah', color: 'text-slate-700' },
                { value: 'delete', label: 'Hapus', color: 'text-rose-500' }
            ],
            (val) => {
                // Jeda 150ms agar modal menu hilang dulu, baru modal konfirmasi/edit mekar
                setTimeout(() => {
                    if (val === 'edit') this.editMetadata(item.id);
                    else if (val === 'move') this.promptMoveItem(item);
                    else if (val === 'delete') this.handleDeleteItem(item.id);
                }, 150);
            }
        );
    };


}