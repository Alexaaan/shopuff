'use client';

import { useState } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { ProductsSection } from '@/components/ProductsSection';
import { AboutSection } from '@/components/AboutSection';
import { Cart } from '@/components/Cart';
import { Header } from '@/components/Header';
import { LoginScreen } from '@/components/LoginScreen';
import { useAuth } from '@/lib/AuthContext';

export default function Home() {
  const { user, isLoading } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen">
      <Header onCartClick={() => setIsCartOpen(true)} />
      <main>
        <HeroSection />
        <ProductsSection />
        <AboutSection />
      </main>
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
