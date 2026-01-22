'use client';

import React, { useState, useCallback } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useOfflineProducts } from '@/hooks/useOfflineProducts';
import { useAuth } from '@/lib/AuthContext';
import { productService } from '@/services/product.service';
import { ProductsTable } from '@/components/admin/products/ProductsTable';
import { OfflineProductsTable } from '@/components/admin/products/OfflineProductsTable';
import { ProductFormModal } from '@/components/admin/products/ProductFormModal';
import { ProductFilters } from '@/types/product';

type TabType = 'products' | 'offline';

export default function ProductsAdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [productFilters, setProductFilters] = useState<ProductFilters>({
    search: '',
    is_active: true
  });
  const [offlineFilters, setOfflineFilters] = useState<ProductFilters>({
    search: '',
    status: 'pending'
  });

  // Products hooks
  const {
    products,
    loading: productsLoading,
    error: productsError,
    updateProduct,
    deleteProduct,
    refresh: refreshProducts
  } = useProducts();

  // Offline products hooks
  const {
    offlineProducts,
    loading: offlineLoading,
    error: offlineError,
    createProduct,
    updateProduct: updateOfflineProduct,
    deleteProduct: deleteOfflineProduct,
    approveProduct,
    refresh: refreshOffline
  } = useOfflineProducts();

  const handleProductUpdate = useCallback(async (data: any) => {
    await updateProduct(data);
  }, [updateProduct]);

  const handleProductCreate = useCallback(async (data: any) => {
    // Create directly in products table
    await productService.createProduct({
      nom: data.nom,
      prix: parseFloat(data.prix),
      image: data.image || undefined,
      description: data.description || undefined,
      stock: parseInt(data.stock) || 0
    });
    await refreshProducts();
  }, [refreshProducts]);

  const handleProductDelete = useCallback(async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      await deleteProduct(id);
    }
  }, [deleteProduct]);

  const handleOfflineCreate = useCallback(async (data: any) => {
    const prix = parseFloat(data.prix);
    const stock = parseInt(data.stock) || 0;
    if (isNaN(prix) || prix <= 0) {
      throw new Error('Prix invalide');
    }
    await createProduct({
      nom: data.nom,
      prix,
      image: data.image || undefined,
      description: data.description || undefined,
      stock,
      created_by: user?.id
    });
  }, [createProduct, user?.id]);

  const handleOfflineApprove = useCallback(async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir approuver ce produit ?')) {
      await approveProduct(id);
      await refreshProducts(); // Refresh active products list
    }
  }, [approveProduct, refreshProducts]);

  const handleOfflineReject = useCallback(async (id: number) => {
    await updateOfflineProduct(id, { status: 'rejected' });
  }, [updateOfflineProduct]);

  const handleOfflineDelete = useCallback(async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit hors ligne ?')) {
      await deleteOfflineProduct(id);
    }
  }, [deleteOfflineProduct]);

  const handleOfflineEdit = useCallback(async (id: number, data: any) => {
    await updateOfflineProduct(id, data);
  }, [updateOfflineProduct]);

  const handleProductFiltersChange = useCallback((filters: Partial<ProductFilters>) => {
    setProductFilters(prev => ({ ...prev, ...filters }));
  }, []);

  const handleOfflineFiltersChange = useCallback((filters: Partial<ProductFilters>) => {
    setOfflineFilters(prev => ({ ...prev, ...filters }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Gestion des Produits</h1>
          <p className="mt-2 text-purple-200 text-sm sm:text-base">
            Gérez vos produits actifs et les produits en attente d'approbation
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('products')}
              className={`whitespace-nowrap py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'products'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-slate-800/50 text-purple-200 hover:bg-slate-700/50 hover:text-white border border-purple-500/30'
              }`}
            >
              🛍️ Produits Actifs ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('offline')}
              className={`whitespace-nowrap py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'offline'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-slate-800/50 text-purple-200 hover:bg-slate-700/50 hover:text-white border border-purple-500/30'
              }`}
            >
              📋 Produits Hors Ligne ({offlineProducts.length})
            </button>
          </nav>
        </div>

        {/* Error Messages */}
        {(productsError || offlineError) && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">
              {productsError || offlineError}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-white">Produits Actifs</h2>
                <p className="text-sm text-purple-200">Produits actuellement disponibles dans votre inventaire</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all flex items-center gap-2 shadow-lg"
              >
                <span>+</span>
                <span>Ajouter un Produit</span>
              </button>
            </div>

            <ProductsTable
              products={products}
              loading={productsLoading}
              onEdit={handleProductUpdate}
              onDelete={handleProductDelete}
              filters={productFilters}
              onFiltersChange={handleProductFiltersChange}
            />
          </div>
        )}

        {/* Offline Products Tab */}
        {activeTab === 'offline' && (
          <div>
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-white">Catalogue Produits</h2>
                <p className="text-sm text-purple-200">Gérez votre catalogue de produits disponibles</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all flex items-center gap-2 shadow-lg"
              >
                <span>+</span>
                <span>Ajouter au Catalogue</span>
              </button>
            </div>

            <OfflineProductsTable
              products={offlineProducts}
              loading={offlineLoading}
              onApprove={handleOfflineApprove}
              onReject={handleOfflineReject}
              onDelete={handleOfflineDelete}
              onEdit={handleOfflineEdit}
              filters={offlineFilters}
              onFiltersChange={handleOfflineFiltersChange}
            />
          </div>
        )}

        {/* Create Product Modal */}
        <ProductFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={activeTab === 'products' ? handleProductUpdate : handleOfflineCreate}
          title={activeTab === 'products' ? 'Ajouter un Produit' : 'Ajouter un Produit Hors Ligne'}
        />
      </div>
    </div>
  );
}