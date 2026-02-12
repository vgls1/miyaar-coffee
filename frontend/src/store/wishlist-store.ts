import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistItem {
    id: number;
    slug: string;
    name: string;
    price: number;
    image: string;
}

interface WishlistState {
    items: WishlistItem[];
    addItem: (item: WishlistItem) => void;
    removeItem: (id: number) => void;
    isInWishlist: (id: number) => boolean;
    toggleItem: (item: WishlistItem) => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => set((state) => ({ items: [...state.items, item] })),
            removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
            isInWishlist: (id) => get().items.some((i) => i.id === id),
            toggleItem: (item) => {
                const { isInWishlist, addItem, removeItem } = get();
                if (isInWishlist(item.id)) {
                    removeItem(item.id);
                } else {
                    addItem(item);
                }
            }
        }),
        {
            name: 'wishlist-storage',
        }
    )
);
