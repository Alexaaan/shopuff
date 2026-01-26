'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, UserPlus, Users } from 'lucide-react';

interface User {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    secret_code: '',
    role: 'user'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        setForm({ nom: '', prenom: '', telephone: '', secret_code: '', role: 'user' });
        loadUsers();
      } else {
        alert('Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Erreur serveur');
    }
  }

  async function updateUserStatus(userId: number, isActive: boolean) {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive })
      });

      if (response.ok) {
        setUsers(users.map(user =>
          user.id === userId ? { ...user, is_active: isActive } : user
        ));
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Erreur serveur');
    }
  }



  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active && u.role === 'user').length,
    admins: users.filter(u => u.role === 'admin').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-fredoka font-bold mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-muted-foreground">
            Créez et gérez les comptes utilisateurs
          </p>
        </div>

        {/* Create User Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Créer un nouvel utilisateur
          </h2>

          <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prénom</label>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nom</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Téléphone</label>
              <input
                type="tel"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Code secret</label>
              <input
                type="password"
                value={form.secret_code}
                onChange={(e) => setForm({ ...form, secret_code: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rôle</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border focus:border-primary focus:outline-none transition-colors"
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>

            <div className="flex items-end">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Créer l'utilisateur
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Utilisateurs</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Actifs</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Utilisateurs ({users.length})
            </h2>
          </div>

          <div className="divide-y divide-border">
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-sm">
                        {user.prenom[0]}{user.nom[0]}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-medium">
                        {user.prenom} {user.nom}
                      </h3>
                      <p className="text-sm text-muted-foreground">{user.telephone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : user.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {user.role !== 'admin' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateUserStatus(user.id, !user.is_active)}
                        className={`px-3 py-1 text-white rounded text-sm font-medium transition-colors ${
                          user.is_active
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {user.is_active ? 'Désactiver' : 'Activer'}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {users.length === 0 && (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aucun utilisateur créé pour le moment
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}