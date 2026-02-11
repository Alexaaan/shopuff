'use client';

import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { Cart } from '@/components/Cart';
import { useState } from 'react';

export const FloatingCartButton = () => {
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const cartItemCount = cart.reduce((total, item) => total + 1, 0);

  if (cartItemCount === 0) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative p-4 rounded-full glass-card shadow-lg"
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingBag className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-background">
            {cartItemCount}
          </span>
        </motion.button>
      </motion.div>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};
