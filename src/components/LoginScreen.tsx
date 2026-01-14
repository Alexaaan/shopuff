'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export const LoginScreen = () => {
  const { login } = useAuth();
  const [secretCode, setSecretCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(secretCode);
    if (!success) {
      setError('Code secret invalide');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-card to-muted z-50 flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-secondary/20 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 glass-card p-8 rounded-2xl max-w-md w-full mx-4"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-primary/30 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-poppins text-muted-foreground">
              Accès requis
            </span>
          </div>

          <img
            src="/logoo.png"
            alt="Shopuff"
            className="h-12 md:h-16 w-auto mb-4 mx-auto block"
          />

          <p className="font-poppins text-muted-foreground">
            Entrez votre code secret pour accéder à la boutique
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder="Code secret"
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-muted/50 border border-border focus:border-primary focus:outline-none transition-colors"
              required
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-destructive text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? 'Connexion...' : 'Accéder'}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Contactez l'administrateur pour obtenir votre code secret
          </p>
        </div>
      </motion.div>
    </div>
  );
};