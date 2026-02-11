'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Star, MessageCircle, Heart } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/lib/ToastContext';
import { FloatingCartButton } from '@/components/FloatingCartButton';

interface Product {
  id: number;
  nom: string;
  prix: number;
  image: string;
  description: string;
  stock: number;
  average_rating: number;
  rating_count: number;
}

interface Rating {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  users: {
    nom: string;
    prenom: string;
  };
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState<number>(0);
  const [userComment, setUserComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  const productId = params.id as string;

  useEffect(() => {
    if (productId) {
      loadProduct();
      loadRatings();
      loadFavoriteStatus();
    }
  }, [productId]);

  const loadFavoriteStatus = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const favorites = await response.json();
        const isFav = favorites.some((f: { product_id: number }) => f.product_id === parseInt(productId));
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error('Error loading favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      showToast('Connectez-vous pour ajouter aux favoris', 'warning');
      return;
    }
    
    setTogglingFavorite(true);
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: parseInt(productId) })
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
        showToast(
          data.isFavorite ? `${product?.nom} ajouté aux favoris` : `${product?.nom} retiré des favoris`,
          'success'
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setTogglingFavorite(false);
    }
  };

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/ratings`);
      if (response.ok) {
        const data = await response.json();
        setRatings(data);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const submitRating = async () => {
    if (!user || !userRating) return;

    setSubmittingRating(true);
    try {
      const response = await fetch(`/api/products/${productId}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: userRating,
          comment: userComment.trim()
        })
      });

      if (response.ok) {
        setUserRating(0);
        setUserComment('');
        loadProduct(); // Refresh product with new rating
        loadRatings(); // Refresh ratings list
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden glass-card">
              <img
                src={product.image}
                alt={product.nom}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl lg:text-4xl font-fredoka font-bold mb-4">
                {product.nom}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.average_rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.average_rating.toFixed(1)}) • {product.rating_count} avis
                </span>
              </div>

              {/* Price */}
              <div className="text-3xl font-fredoka font-bold chicha-gradient-text mb-6">
                {product.prix.toFixed(2)}€
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {product.stock > 0 ? `En stock (${product.stock})` : "Rupture de stock"}
                </span>
              </div>

              {/* Description */}
              <div className="prose prose-gray max-w-none mb-8">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || "Aucune description disponible."}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <motion.button
                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground py-4 px-8 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={product.stock === 0}
                  onClick={() => {
                    addToCart({
                      id: product.id,
                      nom: product.nom,
                      prix: product.prix,
                      image: product.image
                    });
                    showToast(`${product.nom} ajouté au panier`, 'success');
                    if (navigator.vibrate) navigator.vibrate(50);
                  }}
                >
                  <ShoppingBag className="w-5 h-5 inline mr-2" />
                  Ajouter au panier
                </motion.button>

                <motion.button
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    isFavorite 
                      ? 'border-red-500 bg-red-500/10' 
                      : 'border-muted hover:border-primary'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleFavorite}
                  disabled={togglingFavorite}
                >
                  {isFavorite ? (
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  ) : (
                    <Heart className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Ratings Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 space-y-8"
        >
          <h2 className="text-2xl font-fredoka font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Avis clients ({ratings.length})
          </h2>

          {/* Add Rating (if logged in) */}
          {user && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-semibold">Donner votre avis</h3>

              {/* Rating Stars */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= userRating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted hover:text-yellow-400"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Comment */}
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Votre commentaire (optionnel)"
                className="w-full p-3 rounded-lg border bg-background resize-none"
                rows={3}
              />

              <button
                onClick={submitRating}
                disabled={!userRating || submittingRating}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {submittingRating ? 'Envoi...' : 'Publier l\'avis'}
              </button>
            </div>
          )}

          {/* Ratings List */}
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating.id} className="glass-card p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-sm">
                        {rating.users.prenom[0]}{rating.users.nom[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {rating.users.prenom} {rating.users.nom}
                      </p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </span>
                </div>

                {rating.comment && (
                  <p className="text-muted-foreground">{rating.comment}</p>
                )}
              </div>
            ))}

            {ratings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucun avis pour le moment. Soyez le premier !
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Floating Cart Button */}
      <FloatingCartButton />
    </div>
  );
}