'use client';

import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from '@/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ShoppingBag, Truck, CreditCard, ChevronRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/axios';
import { toast } from 'sonner';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is too short'),
  city: z.string().min(2, 'City is required'),
  paymentMethod: z.enum(['cod', 'card']),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const t = useTranslations('Checkout');
  const { items, clearCart, _hasHydrated } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Calculate totalPrice locally to ensure reactivity and avoid getter issues
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, router]);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema) as any,
    defaultValues: {
      fullName: user?.name || '',
      phone: '',
      address: '',
      city: '',
      paymentMethod: 'cod',
    },
  });

  const onSubmit = async (values: CheckoutValues) => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: `${values.address}, ${values.city}`,
        phone: values.phone,
        paymentMethod: values.paymentMethod,
        total: totalPrice
      };

      const { data } = await api.post('/orders', orderData);
      
      toast.success('Order placed successfully!');
      clearCart();
      router.push(`/checkout/success?id=${data.id}`);
    } catch (error: any) {
      console.error('Order creation failed:', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || !isAuthenticated || !_hasHydrated) return null;

  return (
    <main className="min-h-screen pt-32 pb-24 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-200 to-gold-500 mb-12">
          {t('title')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Side */}
          <div className="lg:col-span-7">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Shipping Info */}
                <div className="bg-brand-warmBlack/50 backdrop-blur-sm border border-gold-500/10 rounded-2xl p-8 space-y-6">
                  <div className="flex items-center gap-3 border-b border-gold-500/10 pb-4">
                    <Truck className="w-5 h-5 text-gold-500" />
                    <h2 className="text-xl font-serif text-brand-offWhite">{t('shipping')}</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-brand-parchment uppercase text-xs tracking-wider">{t('fullName')}</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-brand-charcoal border-gold-500/20 h-11 focus:border-gold-500/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-brand-parchment uppercase text-xs tracking-wider">{t('phone')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+966 ..." className="bg-brand-charcoal border-gold-500/20 h-11 focus:border-gold-500/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-brand-parchment uppercase text-xs tracking-wider">{t('address')}</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-brand-charcoal border-gold-500/20 h-11 focus:border-gold-500/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-brand-parchment uppercase text-xs tracking-wider">{t('city')}</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-brand-charcoal border-gold-500/20 h-11 focus:border-gold-500/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-brand-warmBlack/50 backdrop-blur-sm border border-gold-500/10 rounded-2xl p-8 space-y-6">
                  <div className="flex items-center gap-3 border-b border-gold-500/10 pb-4">
                    <CreditCard className="w-5 h-5 text-gold-500" />
                    <h2 className="text-xl font-serif text-brand-offWhite">{t('payment')}</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label 
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${form.watch('paymentMethod') === 'cod' ? 'border-gold-500 bg-gold-500/10' : 'border-gold-500/20 bg-brand-charcoal hover:border-gold-500/40'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.watch('paymentMethod') === 'cod' ? 'border-gold-500' : 'border-gold-500/30'}`}>
                          {form.watch('paymentMethod') === 'cod' && <div className="w-2 h-2 rounded-full bg-gold-500" />}
                        </div>
                        <span className="text-brand-offWhite text-sm">{t('cashOnDelivery')}</span>
                      </div>
                      <input type="radio" {...form.register('paymentMethod')} value="cod" className="hidden" />
                    </label>

                    <label 
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer opacity-50 grayscale`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border-2 border-gold-500/30" />
                        <span className="text-brand-offWhite text-sm">{t('creditCard')} (Coming Soon)</span>
                      </div>
                      <input type="radio" disabled className="hidden" />
                    </label>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting || items.length === 0}
                  className="w-full h-16 bg-gold-500 hover:bg-gold-600 text-black font-bold text-lg rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all transform hover:-translate-y-1"
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : t('placeOrder')}
                </Button>
              </form>
            </Form>
          </div>

          {/* Sidebar Side */}
          <div className="lg:col-span-5">
            <div className="bg-brand-warmBlack/50 backdrop-blur-sm border border-gold-500/10 rounded-2xl p-8 sticky top-32 space-y-8">
              <div className="flex items-center gap-3 border-b border-gold-500/10 pb-4">
                <ShoppingBag className="w-5 h-5 text-gold-500" />
                <h2 className="text-xl font-serif text-brand-offWhite">{t('orderSummary')}</h2>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gold-500/20 scrollbar-track-transparent">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gold-500/10 bg-brand-charcoal">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-sm font-serif text-brand-offWhite line-clamp-1 group-hover:text-gold-400 transition-colors uppercase tracking-tight">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.quantity} × {item.price} SAR</p>
                    </div>
                    <div className="flex items-center text-sm font-mono text-gold-500">
                      {item.price * item.quantity} SAR
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-gold-500/10">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('subtotal')}</span>
                  <span className="font-mono">{totalPrice.toFixed(2)} SAR</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('shippingFee')}</span>
                  <span className="text-gold-400 font-serif italic">{t('free')}</span>
                </div>
                <div className="flex justify-between text-xl font-serif text-brand-offWhite pt-4 border-t border-gold-500/5">
                  <span className="font-bold tracking-tight uppercase">{t('total')}</span>
                  <span className="font-mono text-gold-500 font-bold">{totalPrice.toFixed(2)} SAR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
