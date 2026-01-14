'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, User, LogOut, MessageCircle, Shield } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onCartClick: () => void;
  onChatClick?: () => void;
}

export const Header = ({ onCartClick, onChatClick }: HeaderProps) => {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      checkPendingOrders();
    }
  }, [user]);

  const checkPendingOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const orders = await response.json();
      const pending = orders.filter((order: any) => order.utilisateur_id === user?.id && order.statut === 'en_attente');
      setPendingOrderId(pending.length > 0 ? pending[0].id : null);
    } catch (error) {
      console.error('Error checking pending orders:', error);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 w-full h-20 glass-card"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{user.prenom} {user.nom}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                {pendingOrderId && onChatClick && (
                  <motion.button
                    onClick={onChatClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Chat commande en cours"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </motion.button>
                )}

                {user?.role === 'admin' && (
                  <motion.button
                    onClick={() => window.location.href = '/admin/dashboard'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Dashboard Admin"
                  >
                    <Shield className="w-6 h-6" />
                  </motion.button>
                )}

                <motion.button
                  onClick={onCartClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </motion.button>

                <motion.button
                  onClick={logout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};