import React, { useState, useMemo } from 'react';
import { OfflineProduct, ProductFilters, OfflineProductCreateData } from '@/types/product';
import { StatusBadge } from './StatusBadge';
import { LoadingSkeleton } from './LoadingSkeleton';

interface OfflineProductsTableProps {
  products: OfflineProduct[];
  loading: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, data: Partial<OfflineProductCreateData & { status: 'pending' | 'approved' | 'rejected' }>) => void;
  filters: ProductFilters;
  onFiltersChange: (filters: Partial<ProductFilters>) => void;
}

export const OfflineProductsTable: React.FC<OfflineProductsTableProps> = ({
  products,
  loading,
  onApprove,
  onReject,
  onDelete,
  onEdit,
  filters,
  onFiltersChange
}) => {
  const [editingCell, setEditingCell] = useState<{ id: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.nom.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = !filters.status || product.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [products, filters]);

  const handleInlineEdit = (product: OfflineProduct, field: 'stock') => {
    setEditingCell({ id: product.id, field });
    setEditValue(product[field].toString());
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;

    const value = parseInt(editValue);
    if (isNaN(value) || value < 0) return;

    onEdit(editingCell.id, { [editingCell.field]: value });
    setEditingCell(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  if (loading) {
    return <LoadingSkeleton rows={5} />;
  }

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden border border-purple-500/20">
      {/* Filters - Mobile optimized */}
      <div className="p-4 border-b border-purple-500/30 bg-slate-700/50">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="🔍 Rechercher par nom..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
          <select
            value={filters.status || ''}
            onChange={(e) => onFiltersChange({ status: e.target.value as any || undefined })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          >
            <option value="">📊 Tous les statuts</option>
            <option value="pending">⏳ En attente</option>
            <option value="approved">✅ Approuvé</option>
            <option value="rejected">❌ Rejeté</option>
          </select>
        </div>
      </div>

      {/* Mobile Cards View - Primary interface for mobile admins */}
      <div className="block xl:hidden">
        {filteredProducts.map((product) => (
          <div key={product.id} className="p-6 border-b border-purple-500/20 bg-slate-700/30 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={product.image}
                alt={product.nom}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg">{product.nom}</h3>
                <p className="text-sm text-purple-200 mt-1">{product.description || 'Aucune description'}</p>
                <div className="flex items-center gap-3 mt-2">
                  <StatusBadge status={product.status} />
                  <span className="text-xs text-gray-500">
                    {new Date(product.created_at).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <span className="text-xs text-gray-500">Prix</span>
                <div className="text-sm font-medium">{product.prix}€</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Stock</span>
                {editingCell?.id === product.id && editingCell.field === 'stock' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      min="0"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-16 px-2 py-1 border border-purple-500/50 rounded text-sm bg-slate-700/70 text-white focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-xl text-base font-bold shadow-lg transition-all"
                    >
                      ✓ Valider
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-xl text-base font-bold shadow-lg transition-all"
                    >
                      ✕ Annuler
                    </button>
                  </div>
                ) : (
                  <div
                    className="text-sm font-medium cursor-pointer hover:bg-purple-500/30 px-3 py-2 rounded-lg mt-1 transition-colors"
                    onClick={() => handleInlineEdit(product, 'stock')}
                  >
                    {product.stock}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {product.status === 'pending' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onApprove(product.id)}
                    className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 text-lg font-bold shadow-lg transition-all"
                  >
                    ✓ Approuver
                  </button>
                  <button
                    onClick={() => onReject(product.id)}
                    className="w-full bg-yellow-600 text-white py-4 rounded-xl hover:bg-yellow-700 text-lg font-bold shadow-lg transition-all"
                  >
                    ✗ Rejeter
                  </button>
                </div>
              )}
              {product.status === 'approved' && (
                <div className="space-y-3">
                  <div className="w-full text-center py-4 text-green-400 font-bold bg-green-900/30 rounded-xl border border-green-500/30">
                    ✅ Approuvé
                  </div>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="w-full bg-red-600 text-white py-4 rounded-xl hover:bg-red-700 text-lg font-bold shadow-lg transition-all"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              )}
              {product.status === 'rejected' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onApprove(product.id)}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 text-lg font-bold shadow-lg transition-all"
                  >
                    ↺ Réactiver
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="w-full bg-red-600 text-white py-4 rounded-xl hover:bg-red-700 text-lg font-bold shadow-lg transition-all"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View - Only on very large screens */}
      <div className="hidden xl:block overflow-x-auto">
        <table className="min-w-full divide-y divide-purple-500/20">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                Créé le
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-800/30 divide-y divide-purple-500/20">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={product.image}
                    alt={product.nom}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{product.nom}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {product.prix}€
                </td>
                <td className="px-6 py-4 text-sm text-purple-200 max-w-xs truncate">
                  {product.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {product.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={product.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(product.created_at).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    {product.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onApprove(product.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-xs font-medium"
                        >
                          ✓ Approuver
                        </button>
                        <button
                          onClick={() => onReject(product.id)}
                          className="bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 text-xs font-medium"
                        >
                          ✗ Rejeter
                        </button>
                      </>
                    )}
                    {product.status === 'approved' && (
                      <span className="text-green-600 font-medium">Approuvé</span>
                    )}
                    {product.status === 'rejected' && (
                      <button
                        onClick={() => onApprove(product.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-xs font-medium"
                      >
                        ↺ Réactiver
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(product.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 text-xs font-medium ml-2"
                      title="Supprimer du catalogue"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📋</div>
          <p>Aucun produit hors ligne trouvé</p>
          <p className="text-sm">Utilisez le bouton "Ajouter un Produit Hors Ligne" pour en créer</p>
        </div>
      )}
    </div>
  );
};