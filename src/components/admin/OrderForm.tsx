'use client';

import React, { useState, useEffect } from 'react';

interface Product {
  id: number;
  nom: string;
  prix: number;
  stock: number;
}

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

interface OrderItem {
  product_id: number;
  quantite: number;
  prix_unitaire: number;
  product: Product;
}

interface OrderFormData {
  client_type: 'existing' | 'new' | 'unique';
  existing_client_id?: number;
  new_client: {
    nom: string;
    prenom: string;
    telephone: string;
  };
  unique_client: {
    prenom: string;
  };
  items: OrderItem[];
  payment_method: string;
  adresse_livraison?: string;
  notes?: string;
  order_date: string;
  order_time: string;
}

interface OrderFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function OrderForm({ onSubmit, onCancel, loading = false }: OrderFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<OrderFormData>({
    client_type: 'existing',
    new_client: {
      nom: '',
      prenom: '',
      telephone: ''
    },
    unique_client: {
      prenom: ''
    },
    items: [],
    payment_method: 'espece',
    adresse_livraison: '',
    notes: '',
    order_date: new Date().toISOString().split('T')[0],
    order_time: new Date().toTimeString().slice(0, 5)
  });

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const addProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = formData.items.find(item => item.product_id === productId);
    if (existingItem) {
      // Augmenter la quantité si déjà dans le panier
      updateQuantity(productId, existingItem.quantite + 1);
    } else {
      // Ajouter nouveau produit
      const newItem: OrderItem = {
        product_id: productId,
        quantite: 1,
        prix_unitaire: product.prix,
        product: product
      };
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }
  };

  const updateQuantity = (productId: number, quantite: number) => {
    if (quantite <= 0) {
      removeProduct(productId);
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.product_id === productId
          ? { ...item, quantite }
          : item
      )
    }));
  };

  const removeProduct = (productId: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.product_id !== productId)
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.quantite * item.prix_unitaire), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.items.length === 0) {
      alert('Veuillez ajouter au moins un produit');
      return;
    }

    if (formData.client_type === 'existing' && !formData.existing_client_id) {
      alert('Veuillez sélectionner un client existant');
      return;
    }

    if (formData.client_type === 'new' && (!formData.new_client.nom || !formData.new_client.prenom || !formData.new_client.telephone)) {
      alert('Veuillez remplir le nom, prénom et téléphone du nouveau client');
      return;
    }

    if (formData.client_type === 'unique' && !formData.unique_client.prenom.trim()) {
      alert('Veuillez saisir le prénom du client pour la vente rapide');
      return;
    }

    // Combiner date et heure
    const orderDateTime = new Date(`${formData.order_date}T${formData.order_time}`);

    const submitData = {
      ...formData,
      total: calculateTotal(),
      debut_commande: orderDateTime.toISOString(),
      statut: 'confirmee' // Les commandes admin sont automatiquement confirmées
    };

    await onSubmit(submitData);
  };

  return (
    <div className="admin-card p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-3xl">➕</span>
        Nouvelle Commande
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Date et heure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date de commande *
            </label>
            <input
              type="date"
              className="admin-form-input"
              value={formData.order_date}
              onChange={(e) => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Heure de commande *
            </label>
            <input
              type="time"
              className="admin-form-input"
              value={formData.order_time}
              onChange={(e) => setFormData(prev => ({ ...prev, order_time: e.target.value }))}
              required
            />
          </div>
        </div>

        {/* Type de client */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-4">
            Type de client *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-all">
              <input
                type="radio"
                name="client_type"
                value="existing"
                checked={formData.client_type === 'existing'}
                onChange={(e) => setFormData(prev => ({ ...prev, client_type: e.target.value as 'existing' | 'new' | 'unique' }))}
                className="text-purple-500 w-4 h-4"
              />
              <div>
                <div className="text-white font-medium">👤 Client existant</div>
                <div className="text-slate-400 text-sm">Depuis la base de données</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-all">
              <input
                type="radio"
                name="client_type"
                value="new"
                checked={formData.client_type === 'new'}
                onChange={(e) => setFormData(prev => ({ ...prev, client_type: e.target.value as 'existing' | 'new' | 'unique' }))}
                className="text-purple-500 w-4 h-4"
              />
              <div>
                <div className="text-white font-medium">➕ Nouveau client</div>
                <div className="text-slate-400 text-sm">Créer un compte</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-all">
              <input
                type="radio"
                name="client_type"
                value="unique"
                checked={formData.client_type === 'unique'}
                onChange={(e) => setFormData(prev => ({ ...prev, client_type: e.target.value as 'existing' | 'new' | 'unique' }))}
                className="text-purple-500 w-4 h-4"
              />
              <div>
                <div className="text-white font-medium">🎯 Vente rapide</div>
                <div className="text-slate-400 text-sm">Juste un prénom</div>
              </div>
            </label>
          </div>
        </div>

        {/* Client existant */}
        {formData.client_type === 'existing' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sélectionner un client *
            </label>
            <select
              className="admin-form-input"
              value={formData.existing_client_id || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, existing_client_id: parseInt(e.target.value) }))}
              required
            >
              <option value="">Choisir un client...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.prenom} {user.nom} - {user.email}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Nouveau client */}
        {formData.client_type === 'new' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                className="admin-form-input"
                value={formData.new_client.prenom}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  new_client: { ...prev.new_client, prenom: e.target.value }
                }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nom *
              </label>
              <input
                type="text"
                className="admin-form-input"
                value={formData.new_client.nom}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  new_client: { ...prev.new_client, nom: e.target.value }
                }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                className="admin-form-input"
                value={formData.new_client.telephone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  new_client: { ...prev.new_client, telephone: e.target.value }
                }))}
                placeholder="06XXXXXXXX"
                required
              />
            </div>
          </div>
        )}

        {/* Commande unique */}
        {formData.client_type === 'unique' && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="text-lg font-medium text-amber-300">Vente rapide</h3>
                <p className="text-amber-200 text-sm">Commande sans création de compte client</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Prénom du client *
              </label>
              <input
                type="text"
                className="admin-form-input"
                value={formData.unique_client.prenom}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  unique_client: { prenom: e.target.value }
                }))}
                placeholder="Ex: Marie, Jean, etc."
                required
              />
              <p className="text-xs text-slate-400 mt-2">
                💡 Juste pour identifier la vente - aucun compte ne sera créé
              </p>
            </div>
          </div>
        )}

        {/* Produits */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-4">
            Produits *
          </label>

          {/* Sélecteur de produits */}
          <div className="mb-6">
            <select
              className="admin-form-input mb-4"
              onChange={(e) => {
                if (e.target.value) {
                  addProduct(parseInt(e.target.value));
                  e.target.value = '';
                }
              }}
            >
              <option value="">Ajouter un produit...</option>
              {products
                .filter(product => !formData.items.find(item => item.product_id === product.id))
                .map(product => (
                  <option key={product.id} value={product.id}>
                    {product.nom} - {product.prix}€ (Stock: {product.stock})
                  </option>
                ))}
            </select>
          </div>

          {/* Liste des produits sélectionnés */}
          {formData.items.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-medium text-white mb-3">Produits sélectionnés :</h4>
              {formData.items.map((item) => (
                <div key={item.product_id} className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl">
                  <div className="flex-1">
                    <div className="font-medium text-white">{item.product.nom}</div>
                    <div className="text-sm text-slate-400">
                      {item.prix_unitaire}€ × {item.quantite} = {(item.prix_unitaire * item.quantite).toFixed(2)}€
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product_id, item.quantite - 1)}
                        className="w-8 h-8 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-white">{item.quantite}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product_id, item.quantite + 1)}
                        className="w-8 h-8 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center"
                        disabled={item.quantite >= item.product.stock}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProduct(item.product_id)}
                      className="text-red-400 hover:text-red-300 ml-4"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}

              <div className="text-right pt-4 border-t border-slate-700">
                <div className="text-2xl font-bold text-green-400">
                  Total: {calculateTotal().toFixed(2)}€
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Méthode de paiement et livraison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Méthode de paiement *
            </label>
            <select
              className="admin-form-input"
              value={formData.payment_method}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
              required
            >
              <option value="espece">Espèces</option>
              <option value="carte_bleue">Carte bleue</option>
              <option value="cheque">Chèque</option>
              <option value="virement">Virement</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Adresse de livraison
            </label>
            <input
              type="text"
              className="admin-form-input"
              value={formData.adresse_livraison}
              onChange={(e) => setFormData(prev => ({ ...prev, adresse_livraison: e.target.value }))}
              placeholder="Optionnel"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Notes
          </label>
          <textarea
            className="admin-form-input resize-none"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Notes supplémentaires..."
            rows={3}
          />
        </div>

        {/* Boutons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="admin-btn secondary flex-1"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="admin-btn flex-1"
            disabled={loading || formData.items.length === 0}
          >
            {loading ? 'Création...' : `💾 Créer la commande (${calculateTotal().toFixed(2)}€)`}
          </button>
        </div>
      </form>
    </div>
  );
}