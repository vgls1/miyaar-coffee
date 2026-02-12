import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Link } from '@/navigation';
import { ArrowRight, Coffee, Star, ShieldCheck } from 'lucide-react';

export default function Home() {
  const t = useTranslations('Index');

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex flex-col items-center justify-center text-center px-4">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-900/20 via-background to-background z-0" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl animate-pulse z-0" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-600/10 rounded-full blur-3xl animate-pulse delay-1000 z-0" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-sm font-medium tracking-wide uppercase mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Star className="w-4 h-4" /> <span>{t('hero') || 'Luxury Coffee Experience'}</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-gold-200 via-gold-400 to-gold-600 drop-shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {t('title')}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            {t('description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <Link href="/shop">
              <Button size="lg" className="bg-gold-500 hover:bg-gold-600 text-black font-semibold px-8 py-6 text-lg rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]">
                {t('shopNow')} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-secondary/30 relative">
        <div className="max-w-6xl mx-auto grid gap-12 md:grid-cols-3">
            {[
                { icon: Coffee, title: t('features.roastedTitle'), desc: t('features.roastedDesc') },
                { icon: ShieldCheck, title: t('features.sourcedTitle'), desc: t('features.sourcedDesc') },
                { icon: Star, title: t('features.qualityTitle'), desc: t('features.qualityDesc') }
            ].map((feature, idx) => (
                <div key={idx} className="group p-8 rounded-2xl bg-card/50 border border-gold-500/10 hover:border-gold-500/30 transition-all hover:bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl">
                    <div className="w-12 h-12 rounded-full bg-gold-400/10 flex items-center justify-center mb-6 text-gold-400 group-hover:scale-110 transition-transform">
                        <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold font-serif text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
            ))}
        </div>
      </section>
    </main>
  );
}
