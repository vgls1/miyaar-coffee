'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth-store';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export default function RegisterPage() {
  const t = useTranslations('Auth'); 
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    try {
      // Backend: POST /auth/register then POST /auth/login or implicit
      const { data } = await api.post('/auth/register', values);
      // Assuming register returns { access_token } if implicitly logged in context of this backend
      if (data.access_token) {
           login(data.access_token);
      } else {
           // Fallback if it just returns user, try login
           const loginRes = await api.post('/auth/login', { email: values.email, password: values.password });
           login(loginRes.data.access_token);
      }
      
      toast.success(t('registerSuccess') || 'Account created successfully');
      router.push('/profile');
    } catch (error) {
      toast.error(t('registerError') || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen pt-32 pb-24 px-4 flex items-center justify-center bg-background">
      <div className="w-full max-w-md bg-brand-warmBlack/30 border border-gold-500/10 p-8 rounded-2xl backdrop-blur-sm shadow-xl">
        <h1 className="text-3xl font-serif text-brand-offWhite mb-2 text-center">
            {t('registerTitle') || 'Create Account'}
        </h1>
        <p className="text-muted-foreground text-center mb-8">
            {t('registerSubtitle') || 'Join the Miyaar community'}
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-brand-parchment">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} className="bg-brand-charcoal border-gold-500/20" />
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
                  <FormLabel className="text-brand-parchment">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} className="bg-brand-charcoal border-gold-500/20" />
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
                  <FormLabel className="text-brand-parchment">Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} className="bg-brand-charcoal border-gold-500/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-gold-500 hover:bg-gold-600 text-black font-semibold" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('registerButton') || 'Sign Up'}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-gold-400 hover:underline">
            {t('loginLink') || 'Sign In'}
          </Link>
        </div>
      </div>
    </main>
  );
}
