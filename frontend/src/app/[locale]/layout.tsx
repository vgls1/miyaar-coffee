import type { Metadata } from "next";
import { Playfair_Display, Inter, Amiri } from "next/font/google"; // 1
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "./../globals.css";
import Providers from "./providers";
import Navbar from '@/components/navbar';

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const amiri = Amiri({
  subsets: ["arabic"],
  variable: "--font-amiri",
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: "MIYAAR - Luxury Coffee",
  description: "Experience the finest coffee",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${playfair.variable} ${inter.variable} ${amiri.variable} antialiased bg-background text-foreground font-sans`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            <Navbar />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
