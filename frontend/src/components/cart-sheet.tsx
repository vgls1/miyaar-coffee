'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { ShoppingBag, X, Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function CartSheet() {
    const t = useTranslations('Cart');
    const { items, removeItem, updateQuantity, isOpen, toggleCart, _hasHydrated } = useCartStore();
    const [mounted, setMounted] = useState(false);

    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !_hasHydrated) return null;

    return (
        <Sheet open={isOpen} onOpenChange={toggleCart}>
            <SheetContent className="w-full sm:max-w-md bg-brand-charcoal border-l border-gold-500/20 p-0 text-foreground flex flex-col h-full">
                <SheetHeader className="p-6 border-b border-gold-500/10">
                    <SheetTitle className="text-2xl font-serif text-gold-400 flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6" />
                        {t('title')}
                        <span className="text-sm font-sans font-normal text-muted-foreground ml-auto">
                            {items.length} {t('items')}
                        </span>
                    </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-brand-warmBlack flex items-center justify-center mb-4">
                            <ShoppingBag className="w-10 h-10 text-gold-500/30" />
                        </div>
                        <h3 className="text-xl font-serif text-brand-offWhite">{t('empty')}</h3>
                        <p className="text-brand-parchment/60 text-sm max-w-[200px]">
                            {t('emptyDesc')}
                        </p>
                        <Button 
                            onClick={toggleCart} 
                            variant="outline" 
                            className="mt-6 border-gold-500/30 text-gold-400 hover:bg-gold-500/10"
                        >
                            {t('startShopping')}
                        </Button>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        {/* Image */}
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-brand-warmBlack border border-gold-500/10 flex-shrink-0">
                                            <Image 
                                                src={item.image} 
                                                alt={item.name} 
                                                fill 
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-serif text-brand-offWhite line-clamp-2 leading-tight uppercase tracking-tighter">
                                                    {item.name}
                                                </h4>
                                                <button 
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex justify-between items-end mt-2">
                                                <div className="flex items-center gap-3 bg-brand-warmBlack rounded-full px-2 py-1 border border-gold-500/10">
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-6 h-6 flex items-center justify-center text-gold-500 hover:bg-gold-500/10 rounded-full disabled:opacity-50"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-xs font-mono w-4 text-center">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-6 h-6 flex items-center justify-center text-gold-500 hover:bg-gold-500/10 rounded-full"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <div className="font-mono text-gold-400 text-sm">
                                                    {(item.price * item.quantity).toFixed(2)} SAR
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Footer */}
                        <div className="p-6 bg-brand-warmBlack border-t border-gold-500/10 space-y-4">
                            <div className="flex justify-between items-center text-lg font-serif">
                                <span className="text-brand-parchment">{t('total')}</span>
                                <span className="text-gold-400 font-bold">{totalPrice.toFixed(2)} SAR</span>
                            </div>
                            <Link href="/checkout" onClick={() => toggleCart()}>
                                <Button className="w-full h-12 bg-gold-500 hover:bg-gold-600 text-black font-bold text-lg rounded-full shadow-[0_0_20px_rgba(201,168,106,0.3)] hover:shadow-[0_0_35px_rgba(201,168,106,0.5)] transition-all">
                                    {t('checkout')}
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
