'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeroSection } from '@/components/HeroSection';
import { ProductsSection } from '@/components/ProductsSection';
import { Cart } from '@/components/Cart';
import { Header } from '@/components/Header';
import { LoginScreen } from '@/components/LoginScreen';
import { RegisterScreen } from '@/components/RegisterScreen';
import { useAuth } from '@/lib/AuthContext';

export default function Home() {
  const { user, isLoading } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return showLogin ? (
      <LoginScreen onSwitchToRegister={() => setShowLogin(false)} />
    ) : (
      <RegisterScreen onSwitchToLogin={() => setShowLogin(true)} />
    );
  }

  const handleChatClick = () => {
    router.push('/user/chats');
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header onCartClick={() => setIsCartOpen(true)} onChatClick={handleChatClick} />
      <main>
        <HeroSection />
        <ProductsSection />
      </main>
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

