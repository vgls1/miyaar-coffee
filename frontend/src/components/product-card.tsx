'use client';

import Image from 'next/image';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const t = useTranslations('Shop');

    return (
        <div className="group relative rounded-lg border border-gold-400/20 bg-card text-card-foreground shadow-sm hover:shadow-gold-400/20 transition-all duration-300 overflow-hidden">
            <div className="aspect-square relative overflow-hidden bg-muted">
                {product.images && product.images.length > 0 ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">
                        No Image
                    </div>
                )}
            </div>
            <div className="p-4 space-y-2">
                <h3 className="font-serif text-lg font-medium leading-none tracking-tight text-gold-400">
                    {product.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                </p>
                <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-primary">
                        ${Number(product.price).toFixed(2)}
                    </span>
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="border-gold-400 hover:bg-gold-400 hover:text-black transition-colors"
                        disabled={product.stock <= 0}
                    >
                        {product.stock > 0 ? t('addToCart') : t('outOfStock')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
