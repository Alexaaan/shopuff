import { useState, useEffect, useCallback } from 'react';
import { OfflineProduct, OfflineProductCreateData, Product } from '@/types/product';
import { offlineProductService } from '@/services/offline-product.service';

interface UseOfflineProductsReturn {
  offlineProducts: OfflineProduct[];
  loading: boolean;
  error: string | null;
  createProduct: (data: OfflineProductCreateData) => Promise<void>;
  updateProduct: (id: number, data: Partial<OfflineProductCreateData & { status: 'pending' | 'approved' | 'rejected' }>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  approveProduct: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useOfflineProducts(): UseOfflineProductsReturn {
  const [offlineProducts, setOfflineProducts] = useState<OfflineProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOfflineProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await offlineProductService.getOfflineProducts();
      setOfflineProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOfflineProducts();
  }, [fetchOfflineProducts]);

  const createProduct = useCallback(async (data: OfflineProductCreateData) => {
    try {
      setError(null);
      const newProduct = await offlineProductService.createOfflineProduct(data);
      setOfflineProducts(prev => [newProduct, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (
    id: number,
    data: Partial<OfflineProductCreateData & { status: 'pending' | 'approved' | 'rejected' }>
  ) => {
    try {
      setError(null);
      // Optimistic update
      setOfflineProducts(prev =>
        prev.map(product =>
          product.id === id
            ? { ...product, ...data }
            : product
        )
      );

      await offlineProductService.updateOfflineProduct(id, data);
    } catch (err) {
      // Revert optimistic update
      await fetchOfflineProducts();
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  }, [fetchOfflineProducts]);

  const deleteProduct = useCallback(async (id: number) => {
    try {
      setError(null);
      // Optimistic update
      setOfflineProducts(prev => prev.filter(product => product.id !== id));

      await offlineProductService.deleteOfflineProduct(id);
    } catch (err) {
      // Revert optimistic update
      await fetchOfflineProducts();
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  }, [fetchOfflineProducts]);

  const approveProduct = useCallback(async (id: number) => {
    try {
      setError(null);
      // Optimistic update first
      setOfflineProducts(prev =>
        prev.map(product =>
          product.id === id
            ? { ...product, status: 'approved' as const }
            : product
        )
      );

      await offlineProductService.approveOfflineProduct(id);
    } catch (err) {
      // Revert optimistic update on error
      await fetchOfflineProducts();
      setError(err instanceof Error ? err.message : 'Failed to approve product');
      throw err;
    }
  }, [fetchOfflineProducts]);

  const refresh = useCallback(async () => {
    await fetchOfflineProducts();
  }, [fetchOfflineProducts]);

  return {
    offlineProducts,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    approveProduct,
    refresh
  };
}