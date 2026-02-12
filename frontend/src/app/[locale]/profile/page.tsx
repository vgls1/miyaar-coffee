'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Package, Heart, MapPin, LogOut, Loader2, ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Link, useRouter } from '@/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import api from '@/lib/axios';

interface OrderItem {
    id: number;
    productId: number;
    quantity: number;
    price: number | string;
    product: {
        name: string;
        image: string;
        slug: string;
    }
}

interface Order {
    id: number;
    status: string;
    total: number | string;
    createdAt: string;
    orderItems: OrderItem[];
}

const profileSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().optional(), // Optional, only send if changing
});

export default function ProfilePage() {
    const t = useTranslations('Profile');
    const tAuth = useTranslations('Auth');
    const { user, logout, updateProfile, isAuthenticated } = useAuthStore();
    const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlistStore();
    const { addItem } = useCartStore();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('personal');
    const [isLoading, setIsLoading] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);

    // Fetch orders when tab changes to 'orders'
    useEffect(() => {
        if (activeTab === 'orders' && isAuthenticated) {
            const fetchOrders = async () => {
                setIsLoadingOrders(true);
                try {
                    const { data } = await api.get('/orders');
                    setOrders(data);
                } catch (error) {
                    console.error('Failed to fetch orders:', error);
                    toast.error('Failed to load your orders');
                } finally {
                    setIsLoadingOrders(false);
                }
            };
            fetchOrders();
        }
    }, [activeTab, isAuthenticated]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            password: '',
        },
        values: { // Update form when user data is loaded
            name: user?.name || '',
            email: user?.email || '',
            password: '',
        }
    });

    const handleLogout = () => {
        logout();
        toast.message(tAuth('logoutSuccess') || 'Logged out'); // Add translation key if missing, or use default
        router.push('/');
    };

    const onSubmit = async (values: z.infer<typeof profileSchema>) => {
        setIsLoading(true);
        try {
            const updateData: any = { name: values.name, email: values.email };
            if (values.password && values.password.length > 0) {
                updateData.password = values.password;
            }
            await updateProfile(updateData);
            toast.success(t('updateSuccess') || 'Profile updated successfully');
        } catch (error) {
            toast.error(t('updateError') || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const PLACEHOLDER_IMAGES = [
        '/products/1.jpg',
        '/products/2.jpg',
        '/products/3.jpg',
        '/products/4.jpg',
        '/products/5.png',
        '/products/6.png'
    ];

    if (!user) return null; // Or a loading spinner

    return (
        <main className="min-h-screen pt-32 pb-24 px-4 bg-background">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-200 to-gold-500 mb-2">
                            {t('title')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('welcome', { name: user.name })}
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={handleLogout}
                        className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        {t('signOut')}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="md:col-span-3 space-y-2">
                        {[
                            { id: 'personal', label: t('personal'), icon: User },
                            { id: 'orders', label: t('orders'), icon: Package },
                            { id: 'wishlist', label: t('wishlist'), icon: Heart },
                            { id: 'addresses', label: t('addresses'), icon: MapPin },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl transition-all duration-300 ${
                                    activeTab === item.id 
                                        ? 'bg-gold-500 text-black font-semibold shadow-[0_0_20px_-5px_rgba(212,175,55,0.3)]' 
                                        : 'text-muted-foreground hover:bg-white/5 hover:text-gold-200'
                                }`}
                            >
                                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-black' : 'text-gold-500/50'}`} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-9">
                        <div className="bg-brand-warmBlack/50 backdrop-blur-sm border border-gold-500/10 rounded-2xl p-6 md:p-8 min-h-[500px]">
                            
                            {/* Personal Information Tab */}
                            {activeTab === 'personal' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h2 className="text-2xl font-serif text-brand-offWhite border-b border-gold-500/10 pb-4">
                                        {t('personal')}
                                    </h2>
                                    
                                     <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                    <FormLabel className="text-brand-parchment uppercase text-xs tracking-wider">{t('fullName')}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} className="bg-brand-charcoal border-gold-500/20 h-11 focus:border-gold-500/50 transition-colors" />
                                                    </FormControl>
                                                    <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                    <FormLabel className="text-brand-parchment uppercase text-xs tracking-wider">{t('email')}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} className="bg-brand-charcoal border-gold-500/20 h-11 focus:border-gold-500/50 transition-colors" />
                                                    </FormControl>
                                                    <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                    <FormLabel className="text-brand-parchment uppercase text-xs tracking-wider">New Password (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="******" {...field} className="bg-brand-charcoal border-gold-500/20 h-11 focus:border-gold-500/50 transition-colors" />
                                                    </FormControl>
                                                    <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            
                                            <div className="flex justify-end pt-4">
                                                <Button type="submit" className="bg-gold-500 hover:bg-gold-600 text-black font-semibold min-w-[150px]" disabled={isLoading}>
                                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                    {t('saveChanges')}
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </div>
                            )}

                             {/* Orders Tab */}
                             {activeTab === 'orders' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h2 className="text-2xl font-serif text-brand-offWhite border-b border-gold-500/10 pb-4">
                                        {t('orderHistory')}
                                    </h2>
                                    {isLoadingOrders ? (
                                        <div className="flex flex-col items-center justify-center py-20">
                                            <Loader2 className="w-10 h-10 text-gold-500 animate-spin mb-4" />
                                            <p className="text-muted-foreground animate-pulse italic">Retrieving your coffee rituals...</p>
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <Package className="w-12 h-12 mx-auto mb-4 text-gold-500/20" />
                                            <p>{t('noOrders')}</p>
                                            <Button variant="link" className="text-gold-400 mt-2" onClick={() => router.push('/shop')}>
                                                {t('startShopping')}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {orders.map((order) => (
                                                <div key={order.id} className="bg-brand-charcoal border border-gold-500/10 rounded-2xl overflow-hidden hover:border-gold-500/30 transition-all group">
                                                    <div className="p-6 border-b border-gold-500/5 bg-white/5 flex flex-wrap justify-between items-center gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
                                                                <Package className="w-5 h-5 text-gold-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs uppercase tracking-widest text-muted-foreground">Order #{order.id}</p>
                                                                <p className="text-sm font-mono text-gold-500">
                                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                            <div className="text-right">
                                                                <p className="text-xs uppercase tracking-widest text-muted-foreground">Total</p>
                                                                <p className="text-lg font-serif font-bold text-brand-offWhite">{Number(order.total).toFixed(2)} SAR</p>
                                                            </div>
                                                            <div className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-tighter font-bold border ${
                                                                order.status === 'DELIVERED' 
                                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                                                    : 'bg-gold-500/10 text-gold-400 border-gold-500/20'
                                                            }`}>
                                                                {order.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-6 space-y-4">
                                                        {order.orderItems.map((item) => (
                                                            <div key={item.id} className="flex items-center gap-4">
                                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gold-500/10 flex-shrink-0">
                                                                    <Image 
                                                                        src={PLACEHOLDER_IMAGES[item.productId % PLACEHOLDER_IMAGES.length]} 
                                                                        alt={item.product?.name || 'Product'} 
                                                                        fill 
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-serif text-brand-offWhite truncate uppercase tracking-tight">
                                                                        {item.product?.name}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground italic">
                                                                        {item.quantity} x {Number(item.price).toFixed(2)} SAR
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                             )}

                             {/* Wishlist Tab */}
                             {activeTab === 'wishlist' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h2 className="text-2xl font-serif text-brand-offWhite border-b border-gold-500/10 pb-4">
                                        {t('wishlistTitle')}
                                    </h2>
                                    {wishlistItems.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <Heart className="w-12 h-12 mx-auto mb-4 text-gold-500/20" />
                                            <p>{t('wishlistEmpty')}</p>
                                            <Button variant="link" className="text-gold-400 mt-2" onClick={() => router.push('/shop')}>
                                                {t('browseShop')}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {wishlistItems.map((item) => (
                                                <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-gold-500/10 hover:border-gold-500/30 transition-all group">
                                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <h3 className="font-serif text-lg text-brand-offWhite group-hover:text-gold-400 transition-colors line-clamp-1">
                                                                {item.name}
                                                            </h3>
                                                            <p className="text-gold-500 font-mono text-sm">
                                                                {item.price} SAR
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2 mt-2">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                className="h-8 text-xs border-gold-500/30 text-gold-400 hover:bg-gold-500/10"
                                                                onClick={() => {
                                                                    addItem({
                                                                        id: item.id,
                                                                        slug: item.slug,
                                                                        name: item.name,
                                                                        price: item.price,
                                                                        image: item.image
                                                                    });
                                                                    toast.success(t('addedToCart') || "Added to cart");
                                                                }}
                                                            >
                                                                <ShoppingBag className="w-3 h-3 mr-1" />
                                                                Add
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="ghost"
                                                                className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                                onClick={() => {
                                                                    removeFromWishlist(item.id);
                                                                    toast.info("Removed");
                                                                }}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                            <Link href={`/shop/${item.slug}`} className="ml-auto">
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-gold-400">
                                                                    <ArrowRight className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                             )}

                             {/* Addresses Tab */}
                             {activeTab === 'addresses' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h2 className="text-2xl font-serif text-brand-offWhite border-b border-gold-500/10 pb-4">
                                        {t('addressesTitle')}
                                    </h2>
                                    <div className="text-center py-12 text-muted-foreground">
                                        <MapPin className="w-12 h-12 mx-auto mb-4 text-gold-500/20" />
                                        <p>{t('addressesEmpty')}</p>
                                        <Button variant="outline" className="text-gold-400 border-gold-500/20 hover:bg-gold-500/10 mt-4">
                                            {t('addAddress')}
                                        </Button>
                                    </div>
                                </div>
                             )}

                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
