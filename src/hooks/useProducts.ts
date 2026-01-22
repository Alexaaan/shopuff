import { useState, useEffect, useCallback } from 'react';
import { Product, ProductUpdateData, ProductFilters, PaginationState } from '@/types/product';
import { productService } from '@/services/product.service';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  filters: ProductFilters;
  updateProduct: (data: ProductUpdateData) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  setFilters: (filters: Partial<ProductFilters>) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  refresh: () => Promise<void>;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPaginationState] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFiltersState] = useState<ProductFilters>({
    search: '',
    is_active: true
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts();
      setProducts(data);
      setPaginationState(prev => ({ ...prev, total: data.length }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateProduct = useCallback(async (data: ProductUpdateData) => {
    try {
      // Optimistic update
      setProducts(prev =>
        prev.map(product =>
          product.id === data.id
            ? { ...product, ...data }
            : product
        )
      );

      await productService.updateProduct(data);
    } catch (err) {
      // Revert optimistic update on error
      await fetchProducts();
      throw err;
    }
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (id: number) => {
    try {
      // Optimistic update
      setProducts(prev => prev.filter(product => product.id !== id));

      await productService.deleteProduct(id);
    } catch (err) {
      // Revert optimistic update on error
      await fetchProducts();
      throw err;
    }
  }, [fetchProducts]);

  const setFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const setPagination = useCallback((newPagination: Partial<PaginationState>) => {
    setPaginationState(prev => ({ ...prev, ...newPagination }));
  }, []);

  const refresh = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    filters,
    updateProduct,
    deleteProduct,
    setFilters,
    setPagination,
    refresh
  };
}