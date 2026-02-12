export interface Product {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: string; // Decimal is serialized as string
    stock: number;
    images: string[];
    categoryId: number;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    }
}
