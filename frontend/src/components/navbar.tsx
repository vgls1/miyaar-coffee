'use client';

import { Link, usePathname, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { ShoppingBag, Menu, X, Globe, Search, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import CartSheet from './cart-sheet';

export default function Navbar() {
  const t = useTranslations('Nav');
  const tIndex = useTranslations('Index');
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { totalItems, toggleCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/shop', label: t('shop') },
    // { href: '/about', label: t('about') },
  ];

  return (
    <>
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-500 ease-in-out',
        scrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-gold-400/40 py-4 shadow-[0_0_25px_-5px_rgba(212,175,55,0.3)]'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-6'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group relative">
            <div className="absolute -inset-2 bg-gold-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <h1 className="relative text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#FFF8DC] via-[#D4AF37] to-[#8B4513] tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            {tIndex('title')}
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium tracking-wide text-white/90 hover:text-gold-400 transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-gold-400 after:transition-all hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Search Trigger (Simple redirect to shop for now, or expander) */}
          <Link href="/shop">
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-gold-400 hover:bg-gold-500/10 rounded-full">
                <Search className="w-5 h-5" />
            </Button>
          </Link>

          <Link
            href={pathname}
            locale={locale === 'en' ? 'ar' : 'en'}
            className="flex items-center justify-center p-2 text-white/80 hover:text-gold-400 hover:bg-gold-500/10 rounded-full transition-colors"
            title={t('language')}
          >
            <Globe className="w-5 h-5" />
            <span className="sr-only">{t('language')}</span>
          </Link>

          {/* Profile Link */}
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-gold-400 hover:bg-gold-500/10 rounded-full">
                <User className="w-5 h-5" />
            </Button>
          </Link>

          <Button
            onClick={toggleCart}
            variant="outline"
            className="border-gold-500/30 text-gold-400 hover:bg-gold-500 hover:text-black rounded-full px-6 gap-2 transition-all duration-300 relative"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('cart')}</span>
            {mounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-in zoom-in border border-black">
                    {totalItems}
                </span>
            )}
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gold-400 p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-gold-500/20 p-6 md:hidden flex flex-col gap-6 animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xl font-serif text-white/90 hover:text-gold-400"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px w-full bg-gold-500/20" />
          <div className="flex items-center justify-between">
            <Link
              href={pathname}
              locale={locale === 'en' ? 'ar' : 'en'}
              className="flex items-center gap-2 text-gold-400"
              onClick={() => setIsOpen(false)}
            >
              <Globe className="w-5 h-5" />
              <span>{t('language')}</span>
            </Link>
            
            <button
                onClick={() => {
                    setIsOpen(false);
                    toggleCart();
                }}
                className="flex items-center gap-2 text-gold-400 font-medium"
            >
                <ShoppingBag className="w-5 h-5" />
                {t('cart')}
                {mounted && totalItems > 0 && (
                    <span className="bg-gold-500 text-black px-2 py-0.5 rounded-full text-xs font-bold">
                        {totalItems}
                    </span>
                )}
            </button>
          </div>
        </div>
      )}
    </nav>
    <CartSheet />
    </>
  );
}
