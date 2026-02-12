'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Product } from '@/types/product';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ShoppingBag, Star, Truck, ShieldCheck, Heart } from 'lucide-react';
import { Link } from '@/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { toast } from 'sonner';

async function fetchProduct(slug: string) {
    const { data } = await api.get<Product>(`/products/${slug}`);
    return data;
}

export default function ProductPage() {
    const t = useTranslations('Shop');
    const tProducts = useTranslations('Products');
    const tDetails = useTranslations('ProductDetails');
    const params = useParams();
    const slug = params.slug as string;
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const { addItem } = useCartStore();
    const { toggleItem, isInWishlist } = useWishlistStore();

    const { data: product, isLoading, isError } = useQuery({
        queryKey: ['product', slug],
        queryFn: () => fetchProduct(slug),
        enabled: !!slug,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-gold-400 gap-4">
                <Loader2 className="w-12 h-12 animate-spin" />
                <p className="font-serif tracking-widest animate-pulse">{t('loading')}</p>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-red-400 gap-4">
                <AlertCircle className="w-12 h-12" />
                <p className="font-serif">{t('error')}</p>
                <Link href="/shop">
                    <Button variant="outline" className="border-gold-500/30 text-gold-400 hover:bg-gold-500/10">
                        {t('backToShop')}
                    </Button>
                </Link>
            </div>
        );
    }

    // Dynamic Localization
    const localizedName = tProducts.has(`${slug}.name`) ? tProducts(`${slug}.name`) : product.name;
    const localizedDesc = tProducts.has(`${slug}.description`) ? tProducts(`${slug}.description`) : product.description;

    // Image Logic
    const PLACEHOLDER_IMAGES = [
        '/products/1.jpg',
        '/products/2.jpg',
        '/products/3.jpg',
        '/products/4.jpg',
        '/products/5.png',
        '/products/6.png'
    ];
    
    // Deterministic fallback
    const fallbackImage = PLACEHOLDER_IMAGES[product.id % PLACEHOLDER_IMAGES.length];
    const mainImage = selectedImage || (product.images && product.images.length > 0 ? product.images[0] : fallbackImage);
    const allImages = product.images && product.images.length > 0 ? product.images : [fallbackImage];

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            slug: product.slug,
            name: localizedName,
            price: Number(product.price),
            image: mainImage,
        });
    };

    return (
        <main className="min-h-screen bg-background text-foreground pt-24 pb-12">
            <div className="container mx-auto px-4">
                
                {/* Breadcrumb - could be a component */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 font-light">
                    <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
                    <span className="text-gold-500/30">/</span>
                    <Link href="/shop" className="hover:text-gold-400 transition-colors">Shop</Link>
                    <span className="text-gold-500/30">/</span>
                    <span className="text-gold-400 truncate max-w-[200px]">{localizedName}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                    
                    {/* Left: Gallery */}
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-gold-500/10 shadow-2xl bg-brand-warmBlack group">
                            <Image 
                                src={mainImage}
                                alt={localizedName}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                priority
                            />
                            {/* Luxury Overlay Effect */}
                             <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                        </div>
                        
                        {/* Thumbnails if multiple */}
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                            {allImages.map((img, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={cn(
                                        "relative w-24 h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0",
                                        mainImage === img ? "border-gold-500 shadow-lg scale-105" : "border-transparent opacity-70 hover:opacity-100"
                                    )}
                                >
                                    <Image src={img} alt="Thumbnail" fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                        
                        <div>
                            <div className="text-gold-500 text-sm font-bold tracking-[0.2em] uppercase mb-2">
                                {tDetails('premiumRoast')}
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-brand-offWhite via-brand-parchment to-brand-softGold mb-4 leading-tight">
                                {localizedName}
                            </h1>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex text-gold-500">
                                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                                </div>
                                <span className="text-muted-foreground">{tDetails('reviews', {count: 12})}</span>
                            </div>
                        </div>

                        <div className="text-3xl font-mono text-gold-400 font-light border-b border-gold-500/10 pb-8">
                            {product.price} SAR
                        </div>

                        <p className="text-brand-parchment/80 leading-relaxed font-light text-lg">
                            {localizedDesc}
                        </p>

                        <div className="grid grid-cols-2 gap-4 py-6">
                             {['singleOrigin', 'arabicBeans', 'washedProcess', 'mediumRoast'].map((feat, i) => (
                                 <div key={i} className="flex items-center gap-3 text-sm text-brand-offWhite/80">
                                     <div className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                                     {tDetails(`features.${feat}`)}
                                 </div>
                             ))}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button 
                                size="lg" 
                                onClick={handleAddToCart}
                                className="h-16 flex-1 bg-gold-500 hover:bg-gold-600 text-black font-bold text-lg rounded-full shadow-[0_0_20px_rgba(201,168,106,0.3)] hover:shadow-[0_0_35px_rgba(201,168,106,0.5)] transition-all transform hover:-translate-y-0.5"
                            >
                                <ShoppingBag className="w-5 h-5 mr-2" />
                                {t('addToCart')}
                            </Button>

                            <Button 
                                size="lg" 
                                variant="outline" 
                                onClick={() => {
                                    toggleItem({
                                        id: product.id,
                                        slug: product.slug,
                                        name: localizedName,
                                        price: Number(product.price),
                                        image: mainImage,
                                    });
                                    // Optional: Add toast here or let store handle it? Store is pure.
                                    // Let's add toast here for feedback
                                    if (isInWishlist(product.id)) {
                                         toast.success("Added to wishlist");
                                    } else {
                                         toast.info("Removed from wishlist");
                                    }
                                }}
                                className={cn(
                                    "h-16 w-16 rounded-full border-gold-500/30 hover:bg-gold-500/10 transition-colors",
                                    isInWishlist(product.id) ? "bg-gold-500/20 text-red-500 border-red-500/50 hover:text-red-600" : "text-gold-400 hover:text-gold-300"
                                )}
                            >
                                <Heart className={cn("w-6 h-6", isInWishlist(product.id) && "fill-current")} />
                            </Button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gold-500/10 text-center">
                            <div className="flex flex-col items-center gap-2">
                                <Truck className="w-6 h-6 text-gold-500/70" />
                                <span className="text-xs text-muted-foreground uppercase tracking-widest">{tDetails('badges.fastDelivery')}</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-gold-500/70" />
                                <span className="text-xs text-muted-foreground uppercase tracking-widest">{tDetails('badges.securePayment')}</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Star className="w-6 h-6 text-gold-500/70" />
                                <span className="text-xs text-muted-foreground uppercase tracking-widest">{tDetails('badges.premiumQuality')}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
