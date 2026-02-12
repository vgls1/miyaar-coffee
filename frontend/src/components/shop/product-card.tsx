'use client';

import { Product } from '@/types/product';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Star } from 'lucide-react';
import { Link } from '@/navigation';
import { useCartStore } from '@/store/cart-store';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const t = useTranslations('Shop');
    const { addItem } = useCartStore();

    // Fallback images from public/products
    const PLACEHOLDER_IMAGES = [
        '/products/1.jpg',
        '/products/2.jpg',
        '/products/3.jpg',
        '/products/4.jpg',
        '/products/5.png',
        '/products/6.png'
    ];

    // Use deterministic image based on product ID if no DB image exists
    const displayImage = product.images && product.images.length > 0 
        ? product.images[0] 
        : PLACEHOLDER_IMAGES[product.id % PLACEHOLDER_IMAGES.length];

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();
        
        addItem({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: Number(product.price),
            image: displayImage,
        });
    };

    return (
        <div className="group relative bg-black/60 backdrop-blur-sm border border-gold-500/20 overflow-hidden rounded-xl transition-all duration-500 hover:border-gold-500/50 hover:shadow-[0_0_30px_-5px_rgba(212,175,55,0.15)] flex flex-col h-full">
            
            {/* Image Container */}
            <div className="aspect-[4/5] relative overflow-hidden bg-white/5">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 z-10" />
                
                <Image 
                    src={displayImage} 
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Badge */}
                {product.stock <= 0 && (
                     <div className="absolute top-4 right-4 z-20 bg-red-900/90 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest border border-red-500/30">
                        {t('outOfStock')}
                     </div>
                )}
                
                {/* Quick Add Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                     <Button 
                        onClick={handleAddToCart}
                        className="w-full bg-gold-500 hover:bg-gold-600 text-black font-semibold rounded-none border border-gold-300 shadow-lg"
                     >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        {t('addToCart')}
                     </Button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="text-xs text-gold-400 mb-2 uppercase tracking-widest font-medium">
                    Miyaar Signature
                </div>
                <Link href={`/shop/${product.slug}`} className="block group-hover:text-gold-300 transition-colors">
                    <h3 className="text-xl font-serif font-bold text-white mb-2 leading-tight">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-white/60 text-sm line-clamp-2 mb-4 flex-grow font-light">
                    {product.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gold-500/10">
                    <span className="text-lg font-mono text-gold-400">
                        {product.price} SAR
                    </span>
                    <div className="flex text-gold-500 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
