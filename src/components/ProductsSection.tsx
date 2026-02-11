'use client';

import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { FloatingCartButton } from "./FloatingCartButton";
import { Sparkles, TrendingUp, Star, Clock, Filter, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

interface Product {
  id?: number;
  nom: string;
  prix: number;
  image: string;
  description?: string;
  stock: number;
  average_rating: number;
  rating_count: number;
}

const FILTERS = [
  { id: 'all', label: 'Tout', icon: Filter },
  { id: 'trending', label: '🔥 Populaires', icon: TrendingUp },
  { id: 'new', label: '✨ Nouveautés', icon: Sparkles },
  { id: 'top', label: '⭐ Top notés', icon: Star },
  { id: 'recent', label: '🕐 Récents', icon: Clock },
];

export const ProductsSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to load products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([
        { id: 1, nom: "Jnr Lemon Lime 18k", prix: 12.00, image: "https://jnrpuff.fr/wp-content/uploads/2025/02/JNR-Falcon-X-18000-Lemon-Lime.webp", description: "Citron vert rafraîchissant", stock: 15, average_rating: 4.5, rating_count: 23 },
        { id: 2, nom: "Jnr Sour Apple 18k", prix: 12.00, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkfJXchESEvVl2pA7kobxY3_50TgYKFjmGcA&s", description: "Pomme verte acidulée", stock: 8, average_rating: 4.8, rating_count: 45 },
        { id: 3, nom: "Jnr Grape Ice 18k", prix: 12.00, image: "https://i0.wp.com/onargui.fr/wp-content/uploads/2024/10/PUFF-JNR-FALCON-X-18000-GRAPE-ICE.webp?fit=767%2C767&ssl=1", description: "Raisin glacé", stock: 3, average_rating: 4.2, rating_count: 18 },
        { id: 4, nom: "Jnr Blueberry Raspberry 18k", prix: 12.00, image: "https://jnrpuff.fr/wp-content/uploads/2025/02/JNR-Falcon-X-18000-Blueberry-Raspberry.webp", description: "Myrtille et framboise", stock: 12, average_rating: 4.6, rating_count: 32 },
        { id: 5, nom: "Jnr Sparkling Cherry 18k", prix: 12.00, image: "https://dummyimage.com/400x300/cccccc/000000&text=JNR+SPARKLING+CHERRY", description: "Cerise pétillante", stock: 20, average_rating: 4.0, rating_count: 12 },
        { id: 6, nom: "Jnr Blueberry Kiwi 18k", prix: 12.00, image: "https://jnrpuff.fr/wp-content/uploads/2025/02/JNR-Falcon-X-18000-Blueberry-Kiwi.webp", description: "Myrtille et kiwi", stock: 5, average_rating: 4.7, rating_count: 28 },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = activeFilter === 'all' 
    ? products 
    : activeFilter === 'trending'
    ? [...products].sort((a, b) => b.rating_count - a.rating_count)
    : activeFilter === 'new'
    ? [...products].sort((a, b) => b.stock - a.stock)
    : activeFilter === 'top'
    ? [...products].sort((a, b) => b.average_rating - a.average_rating)
    : activeFilter === 'recent'
    ? [...products].sort((a, b) => (b.id || 0) - (a.id || 0))
    : products;

  const activeLabel = FILTERS.find(f => f.id === activeFilter)?.label || 'Tout';

  return (
    <section id="produits" className="relative py-16 md:py-24">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="font-fredoka text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="chicha-gradient-text">Notre</span>{" "}
            <span className="text-foreground">Collection</span>
          </h2>

          {/* Filter Button with Dropdown */}
          <div className="relative inline-block">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-5 py-2.5 rounded-full font-poppins text-sm font-medium bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center gap-2 transition-all"
            >
              <Filter className="w-4 h-4" />
              {activeLabel}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter Dropdown */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 glass-card rounded-2xl shadow-xl py-2 px-2 min-w-[200px] z-50"
                >
                  {FILTERS.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => {
                          setActiveFilter(filter.id);
                          setShowFilters(false);
                        }}
                        className={`w-full px-4 py-2.5 rounded-xl font-poppins text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                          activeFilter === filter.id
                            ? 'bg-primary/20 text-primary'
                            : 'text-muted-foreground hover:bg-muted/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {filter.label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="glass-card overflow-hidden rounded-2xl">
                  <div className="h-36 sm:h-44 md:h-48 bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-6 bg-muted rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id || index}
                id={product.id || index + 1}
                name={product.nom}
                price={product.prix}
                image={product.image}
                rating={product.average_rating}
                ratingCount={product.rating_count}
                inStock={product.stock > 0}
                stockQuantity={product.stock}
                delay={index * 0.1}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="font-poppins text-muted-foreground">
                Aucun produit trouvé
              </p>
            </div>
          )}
        </div>

        {/* Floating Cart Button */}
        <FloatingCartButton />

        {/* View All Button */}
        {products.length > 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-10"
          >
            <motion.button
              className="px-8 py-4 rounded-full font-fredoka font-semibold text-lg border-2 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Voir toute la collection ({products.length})
            </motion.button>
          </motion.div>
        )}

        {/* Floating Cart Button */}
        <FloatingCartButton />
      </div>
    </section>
  );
}
