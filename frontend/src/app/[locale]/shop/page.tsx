'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Product } from '@/types/product';
import ProductCard from '@/components/shop/product-card';
import { useTranslations } from 'next-intl';
import { Loader2, AlertCircle, Search, Filter, X } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

// Types
interface Category {
    id: number;
    name: string;
    slug: string;
}

interface ProductsResponse {
    data: Product[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}

// Fetchers
async function fetchProducts(params: { search?: string; categoryId?: string }) {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.categoryId) searchParams.append('categoryId', params.categoryId);
    
    const { data } = await api.get<ProductsResponse>(`/products?${searchParams.toString()}`);
    return data;
}

async function fetchCategories() {
    const { data } = await api.get<Category[]>('/categories');
    return data;
}

export default function ShopPage() {
    const t = useTranslations('Shop');
    const tProducts = useTranslations('Products');
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const currentSearch = searchParams.get('search') || '';
    const currentCategory = searchParams.get('categoryId') || '';

    const [searchTerm, setSearchTerm] = useState(currentSearch);
    const debouncedSearch = useDebounce(searchTerm, 500);
    
    // Sync URL with debounced search term
    useEffect(() => {
        if (debouncedSearch !== currentSearch) {
            const params = new URLSearchParams(searchParams);
            if (debouncedSearch) params.set('search', debouncedSearch);
            else params.delete('search');
            
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
    }, [debouncedSearch, currentSearch, pathname, router, searchParams]);

    // Update local state if URL changes externally (e.g. back button)
    useEffect(() => {
        if (currentSearch !== searchTerm) {
             setSearchTerm(currentSearch);
        }
    }, [currentSearch]);

    // Queries
    const { data: productsData, isLoading: isProductsLoading, isError: isProductsError } = useQuery({
        queryKey: ['products', debouncedSearch, currentCategory],
        queryFn: () => fetchProducts({ search: debouncedSearch, categoryId: currentCategory }),
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const products = productsData?.data;

    const handleCategoryChange = (categoryId: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (categoryId) params.set('categoryId', categoryId);
        else params.delete('categoryId');
        // Reset search when changing filtered category might be good UX, but keeping it for now
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    if (isProductsLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-gold-400 gap-4">
                <Loader2 className="w-12 h-12 animate-spin" />
                <p className="font-serif tracking-widest animate-pulse">{t('loading')}</p>
            </div>
        );
    }

    if (isProductsError) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-red-400 gap-4">
                <AlertCircle className="w-12 h-12" />
                <p className="font-serif">{t('error')}</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-24 px-4">
            <div className="container mx-auto">
                {/* Header & Controls */}
                <div className="flex flex-col items-center mb-12 space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-5xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-gold-200 via-gold-400 to-gold-600">
                            {t('title')}
                        </h1>
                        <div className="w-24 h-1 bg-gold-500 mx-auto rounded-full opacity-50" />
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 items-center bg-brand-warmBlack/50 p-4 rounded-2xl border border-gold-500/10 backdrop-blur-sm">
                        
                        {/* Search Input */}
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input 
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                className="w-full bg-brand-charcoal border border-gold-500/20 rounded-xl py-2 pl-10 pr-4 text-brand-offWhite focus:outline-none focus:border-gold-500/50 transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Category Filters */}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-none">
                            <Button
                                variant="outline"
                                onClick={() => handleCategoryChange(null)}
                                className={cn(
                                    "rounded-full border-gold-500/20 text-xs uppercase tracking-wider hover:bg-gold-500/10",
                                    !currentCategory ? "bg-gold-500 text-black hover:bg-gold-600 border-gold-500" : "text-brand-parchment"
                                )}
                            >
                                {t('all')}
                            </Button>
                            {categories?.map((cat) => (
                                <Button
                                    key={cat.id}
                                    variant="outline"
                                    onClick={() => handleCategoryChange(cat.id.toString())}
                                    className={cn(
                                        "rounded-full border-gold-500/20 text-xs uppercase tracking-wider hover:bg-gold-500/10 whitespace-nowrap",
                                        currentCategory === cat.id.toString() ? "bg-gold-500 text-black hover:bg-gold-600 border-gold-500" : "text-brand-parchment"
                                    )}
                                >
                                    {/* Try to translate category, fallback to name */}
                                    {tProducts.has(`Categories.${cat.slug}`) ? tProducts(`Categories.${cat.slug}`) : cat.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {products && products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {products.map((product) => (
                            <ProductCard 
                                key={product.id} 
                                product={{
                                    ...product,
                                    // Use mapped translation if available
                                    name: tProducts.has(`${product.slug}.name`) ? tProducts(`${product.slug}.name`) : product.name,
                                    description: tProducts.has(`${product.slug}.description`) ? tProducts(`${product.slug}.description`) : product.description
                                }} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-brand-warmBlack rounded-full flex items-center justify-center mx-auto mb-6 text-gold-500/30">
                            <Search className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-serif text-brand-offWhite mb-2">{t('noProducts')}</h3>
                        <p className="text-muted-foreground">{t('tryAdjusting')}</p>
                        <Button 
                            variant="link" 
                            className="text-gold-400 mt-4"
                            onClick={() => {
                                setSearchTerm('');
                                handleCategoryChange(null);
                            }}
                        >
                            {t('clearFilters')}
                        </Button>
                    </div>
                )}
            </div>
        </main>
    );
}
