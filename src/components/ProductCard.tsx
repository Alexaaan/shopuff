'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Package, AlertCircle, Check } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useToast } from '@/lib/ToastContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  rating?: number;
  ratingCount?: number;
  inStock?: boolean;
  stockQuantity?: number;
  delay?: number;
}

export const ProductCard = ({
  id,
  name,
  price,
  image,
  rating = 0,
  ratingCount = 0,
  inStock = true,
  stockQuantity = 0,
  delay = 0,
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inStock || isAdding) return;
    
    setIsAdding(true);
    addToCart({ id, nom: name, prix: price, image });
    
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Show toast notification
    showToast(`${name} ajouté au panier`, 'success');
    
    setTimeout(() => setIsAdding(false), 500);
  };

  // Calculate stock status for display
  const getStockStatus = () => {
    if (!inStock || stockQuantity === 0) {
      return { label: 'Rupture', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle };
    }
    if (stockQuantity <= 3) {
      return { label: `${stockQuantity} restants`, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Package };
    }
    return { label: 'En stock', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Package };
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10px' }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-secondary/50 to-accent/50 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500" />

      {/* Card */}
      <div
        className="relative glass-card overflow-hidden cursor-pointer h-full flex flex-col"
        onClick={() => router.push(`/product/${id}`)}
      >
        {/* Image Container */}
        <div className="relative h-36 sm:h-44 md:h-48 overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent z-10" />
          
          {/* Stock Badge */}
          <div className="absolute top-2 left-2 z-20">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 backdrop-blur-sm border border-black/30 ${stockStatus.color}`}>
              <StockIcon className="w-2.5 h-2.5" />
              {stockStatus.label}
            </span>
          </div>

          {/* Rating Badge */}
          {rating > 0 && (
            <div className="absolute top-2 right-2 z-20">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 bg-black/60 text-white backdrop-blur-sm">
                <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                {rating.toFixed(1)}
              </span>
            </div>
          )}

          <motion.img
            src={imageError ? '/logo.png' : image}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          {/* Name */}
          <h3 className="font-fredoka text-base sm:text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>

          {/* Rating Stars */}
          {rating > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(rating) 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-gray-500"
                    }`}
                  />
                ))}
              </div>
              {ratingCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({ratingCount} avis)
                </span>
              )}
            </div>
          )}

          {/* Price & Action */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Prix</span>
              <span className="font-fredoka text-xl font-bold chicha-gradient-text">
                {price.toFixed(2)}€
              </span>
            </div>

            <motion.button
              className={`relative p-3 rounded-full overflow-hidden transition-all ${
                inStock 
                  ? 'bg-primary hover:bg-primary/90' 
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
              whileHover={inStock ? { scale: 1.1 } : {}}
              whileTap={inStock ? { scale: 0.95 } : {}}
              disabled={!inStock || isAdding}
              onClick={handleAddToCart}
            >
              <AnimatePresence mode="wait">
                {isAdding ? (
                  <motion.div
                    key="added"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-green-500"
                  >
                    <span className="text-white text-xs font-bold">✓</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="cart"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <ShoppingBag className="w-5 h-5 text-primary-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
