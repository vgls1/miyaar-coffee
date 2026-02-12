'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

export default function SuccessPage() {
  const t = useTranslations('Success');
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  return (
    <main className="min-h-screen pt-32 pb-24 px-4 bg-background flex flex-col items-center justify-center text-center">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-gold-500/20 blur-3xl rounded-full" />
          <CheckCircle className="w-24 h-24 text-gold-500 mx-auto relative z-10" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-200 to-gold-500">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {t('message')}
          </p>
        </div>

        {orderId && (
          <div className="bg-brand-warmBlack/50 border border-gold-500/10 rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-gold-500/60 mb-1">{t('orderNumber')}</p>
            <p className="text-2xl font-mono text-gold-400 font-bold">#{orderId}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link href="/shop" className="flex-1">
            <Button className="w-full h-14 bg-gold-500 hover:bg-gold-600 text-black font-bold rounded-full transition-all group">
              <ShoppingBag className="w-5 h-5 mr-2" />
              {t('backToShop')}
            </Button>
          </Link>
          <Link href="/profile" className="flex-1">
            <Button variant="outline" className="w-full h-14 border-gold-500/30 text-gold-400 hover:bg-gold-500/10 rounded-full group">
               My Orders
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
