import React, { useState, useMemo } from 'react';
import { Product, ProductFilters, ProductUpdateData } from '@/types/product';
import { LoadingSkeleton } from './LoadingSkeleton';

interface ProductsTableProps {
  products: Product[];
  loading: boolean;
  onEdit: (data: ProductUpdateData) => void;
  onDelete: (id: number) => void;
  filters: ProductFilters;
  onFiltersChange: (filters: Partial<ProductFilters>) => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  loading,
  onEdit,
  onDelete,
  filters,
  onFiltersChange
}) => {
  const [editingCell, setEditingCell] = useState<{ id: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.nom.toLowerCase().includes(filters.search.toLowerCase());
      const matchesActive = filters.is_active === undefined || product.is_active === filters.is_active;
      return matchesSearch && matchesActive;
    });
  }, [products, filters]);

  const handleInlineEdit = (product: Product, field: 'prix' | 'stock') => {
    setEditingCell({ id: product.id, field });
    setEditValue(product[field].toString());
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;

    const value = editingCell.field === 'prix'
      ? parseFloat(editValue)
      : parseInt(editValue);

    if (isNaN(value)) return;

    onEdit({
      id: editingCell.id,
      [editingCell.field]: value
    });

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
            className="w-full px-4 py-3 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base bg-slate-600/50 text-white placeholder-purple-300"
          />
          <select
            value={filters.is_active?.toString() || ''}
            onChange={(e) => onFiltersChange({
              is_active: e.target.value === '' ? undefined : e.target.value === 'true'
            })}
            className="w-full px-4 py-3 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base bg-slate-600/50 text-white"
          >
            <option value="">📊 Tous les statuts</option>
            <option value="true">✅ Actif</option>
            <option value="false">❌ Inactif</option>
          </select>
        </div>
      </div>

      {/* Mobile Cards View - Primary interface for mobile admins */}
      <div className="block xl:hidden">
        {filteredProducts.map((product) => (
          <div key={product.id} className="p-6 border-b border-purple-500/20 bg-slate-700/30">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={product.image}
                alt={product.nom}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg">{product.nom}</h3>
                {product.description && (
                  <p className="text-sm text-purple-200 mt-1 truncate">{product.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit({ id: product.id, is_active: !product.is_active })}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg shadow-sm ${
                    product.is_active
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {product.is_active ? '✓ Actif' : '✗ Inactif'}
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 text-lg font-bold shadow-lg transition-all"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="text-xs text-gray-500">Prix</label>
                {editingCell?.id === product.id && editingCell.field === 'prix' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      step="0.01"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-20 px-2 py-1 border border-purple-500/50 rounded text-sm bg-slate-700/70 text-white focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors"
                      title="Valider"
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors"
                      title="Annuler"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    className="text-sm font-medium cursor-pointer hover:bg-purple-500/30 px-3 py-2 rounded-lg mt-1 transition-colors"
                    onClick={() => handleInlineEdit(product, 'prix')}
                  >
                    {product.prix}€
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-500">Stock</label>
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
                      className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors"
                      title="Valider"
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors"
                      title="Annuler"
                    >
                      ✕
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
                Stock
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
                  {product.description && (
                    <div className="text-sm text-purple-200 truncate max-w-xs">
                      {product.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingCell?.id === product.id && editingCell.field === 'prix' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 px-2 py-1 border border-purple-500/50 rounded text-sm bg-slate-700/70 text-white focus:ring-2 focus:ring-purple-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded-md text-sm font-bold transition-colors"
                        title="Valider"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold transition-colors"
                        title="Annuler"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span
                      className="text-sm text-white cursor-pointer hover:bg-purple-500/30 px-3 py-2 rounded-lg transition-colors"
                      onClick={() => handleInlineEdit(product, 'prix')}
                    >
                      {product.prix}€
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingCell?.id === product.id && editingCell.field === 'stock' ? (
                    <div className="flex items-center gap-2">
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
                        className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded-md text-sm font-bold transition-colors"
                        title="Valider"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold transition-colors"
                        title="Annuler"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span
                      className="text-sm text-white cursor-pointer hover:bg-purple-500/30 px-3 py-2 rounded-lg transition-colors"
                      onClick={() => handleInlineEdit(product, 'stock')}
                    >
                      {product.stock}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit({ id: product.id, is_active: !product.is_active })}
                      className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                        product.is_active
                          ? 'bg-green-600 text-white hover:bg-green-500'
                          : 'bg-red-600 text-white hover:bg-red-500'
                      }`}
                    >
                      {product.is_active ? '✓ Actif' : '✗ Inactif'}
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 text-xs font-medium"
                      title="Supprimer le produit"
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
          <div className="text-4xl mb-2">📦</div>
          <p>Aucun produit trouvé</p>
          <p className="text-sm">Essayez de modifier vos filtres</p>
        </div>
      )}
    </div>
  );
};