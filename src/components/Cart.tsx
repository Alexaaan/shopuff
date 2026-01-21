'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Cart = React.memo(({ isOpen, onClose }: CartProps) => {
  Cart.displayName = 'Cart';
  const { cart, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleOrder = useCallback(async () => {
    if (cart.length === 0 || !user) return;

    if (!confirm('Êtes-vous sûr de vouloir commander ?')) return;

    const utilisateur_id = user.id;

    const orderData = {
      utilisateur_id,
      statut: 'en_attente',
      payment_method: 'espece', // Default, admin can change later
      adresse_livraison: 'A récupérer sur place', // Placeholder
      total,
      order_products: cart.map(item => ({
        product_id: item.id,
        quantite: item.quantity,
        prix_unitaire: item.prix
      }))
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const data = await response.json();
        alert('Commande passée avec succès! Elle sera confirmée par l\'administrateur.');
        clearCart();
        onClose();
        router.push(`/user/chats?orderId=${data.orderId}`);
      } else {
        alert('Erreur lors de la commande');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Erreur lors de la commande');
    }
  }, [cart, user, total, clearCart, onClose, router]);

  return (
    <AnimatePresence>
      {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 glass-card rounded-t-2xl p-6 z-50 max-h-[80vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-fredoka font-bold">Panier</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground">Votre panier est vide</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-muted/50 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.nom}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="font-fredoka font-semibold">{item.nom}</h3>
                          <p className="text-sm text-muted-foreground">{item.prix.toFixed(2)}€</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 hover:bg-destructive/20 text-destructive rounded ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-fredoka font-bold chicha-gradient-text">
                        {total.toFixed(2)}€
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleOrder}
                        className="flex-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                      >
                        Commander
                      </button>
                      <button
                        onClick={onClose}
                        className="flex-1 border-2 border-primary text-primary py-3 rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        Continuer les achats
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
  );
});