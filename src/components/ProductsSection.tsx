'use client';

import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { Sparkles } from "lucide-react";
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

export const ProductsSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
      // Fallback products for demo
      setProducts([
        { id: 1, nom: "Chicha Galaxy Blue", prix: 29.99, image: "/IMG_1530.png", description: "Une chicha élégante avec un design galactique.", stock: 10, average_rating: 4.5, rating_count: 12 },
        { id: 2, nom: "Chicha Nebula Red", prix: 34.99, image: "/IMG_1530.png", description: "Rouge intense comme une nébuleuse.", stock: 5, average_rating: 4.2, rating_count: 8 },
        { id: 3, nom: "Chicha Cosmic Green", prix: 27.99, image: "/IMG_1530.png", description: "Vert cosmique pour une expérience unique.", stock: 15, average_rating: 4.8, rating_count: 15 },
        { id: 4, nom: "Chicha Star Dust", prix: 39.99, image: "/IMG_1530.png", description: "Poussière d'étoiles scintillante.", stock: 3, average_rating: 4.0, rating_count: 6 },
        { id: 5, nom: "Chicha Aurora", prix: 32.99, image: "/IMG_1530.png", description: "Comme une aurore boréale.", stock: 8, average_rating: 4.6, rating_count: 10 },
        { id: 6, nom: "Chicha Meteor", prix: 36.99, image: "/IMG_1530.png", description: "Design météorique impressionnant.", stock: 0, average_rating: 4.3, rating_count: 9 },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="produits" className="relative py-16 md:py-24">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="font-fredoka text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="chicha-gradient-text">Collection</span>{" "}
            <span className="text-foreground"></span>
          </h2>

          <p className="font-poppins text-lg text-muted-foreground max-w-2xl mx-auto">
            Explorez notre sélection exclusive
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            products.map((product, index) => (
              <ProductCard
                key={product.id || index}
                id={product.id || index + 1}
                name={product.nom}
                price={product.prix}
                image={product.image}
                rating={product.average_rating}
                inStock={product.stock > 0}
                delay={index * 0.1}
              />
            ))
          )}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-8"
        >
          <motion.button
            className="px-8 py-4 rounded-full font-fredoka font-semibold text-lg border-2 border-secondary/50 text-secondary hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Voir toute la collection
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};