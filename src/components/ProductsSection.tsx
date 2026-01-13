'use client';

import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface Product {
  nom: string;
  prix: number;
  image: string;
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
        { nom: "Chicha Galaxy Blue", prix: 29.99, image: "/IMG_1530.png" },
        { nom: "Chicha Nebula Red", prix: 34.99, image: "/IMG_1530.png" },
        { nom: "Chicha Cosmic Green", prix: 27.99, image: "/IMG_1530.png" },
        { nom: "Chicha Star Dust", prix: 39.99, image: "/IMG_1530.png" },
        { nom: "Chicha Aurora", prix: 32.99, image: "/IMG_1530.png" },
        { nom: "Chicha Meteor", prix: 36.99, image: "/IMG_1530.png" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="produits" className="relative py-24 md:py-32">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-secondary/30 mb-6">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-poppins text-muted-foreground">
              Nos créations
            </span>
          </div>

          <h2 className="font-fredoka text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="chicha-gradient-text">Collection</span>{" "}
            <span className="text-foreground">Cosmique</span>
          </h2>

          <p className="font-poppins text-lg text-muted-foreground max-w-2xl mx-auto">
            Chaque chicha est une œuvre d'art inspirée des merveilles de
            l'univers, créée avec des saveurs premium et des matériaux de qualité supérieure.
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
                key={index}
                name={product.nom}
                price={product.prix}
                image={product.image}
                rating={5}
                inStock={true}
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
          className="text-center mt-16"
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