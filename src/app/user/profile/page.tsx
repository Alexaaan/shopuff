'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Heart, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { ProductCard } from '@/components/ProductCard';

interface FavoriteProduct {
  id: number;
  nom: string;
  prix: number;
  image: string;
  stock: number;
  average_rating: number;
  rating_count: number;
}

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      // Load favorite product IDs
      const favResponse = await fetch('/api/favorites');
      if (favResponse.ok) {
        const favData = await favResponse.json();
        
        // Load product details for each favorite
        const products: FavoriteProduct[] = [];
        for (const fav of favData) {
          const prodResponse = await fetch(`/api/products/${fav.product_id}`);
          if (prodResponse.ok) {
            const product = await prodResponse.json();
            products.push(product);
          }
        }
        setFavorites(products);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header */}
      <div className="sticky top-0 z-50 glass-card border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-12"
        >
          {/* Large User Icon */}
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-primary" />
          </div>
          
          {/* Username */}
          <h1 className="text-2xl font-fredoka font-bold">
            {user.prenom} {user.nom}
          </h1>
        </motion.div>

        {/* Favorites Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-fredoka font-bold flex items-center gap-2 mb-6">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            Articles favoris
          </h2>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="glass-card overflow-hidden rounded-2xl">
                    <div className="h-36 sm:h-44 bg-muted" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {favorites.map((product, index) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.nom}
                  price={product.prix}
                  image={product.image}
                  rating={product.average_rating}
                  ratingCount={product.rating_count}
                  inStock={product.stock > 0}
                  stockQuantity={product.stock}
                  delay={index * 0.1}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-card rounded-2xl">
              <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Vous n'avez pas encore de favoris
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
