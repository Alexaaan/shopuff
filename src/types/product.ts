export interface Product {
  id: number;
  nom: string;
  prix: number;
  image: string;
  description?: string;
  stock: number;
  is_active: boolean;
  average_rating?: number;
  rating_count?: number;
  created_at?: string;
}

export interface OfflineProduct {
  id: number;
  nom: string;
  prix: number;
  image: string;
  description?: string;
  stock: number;
  is_active: boolean;
  average_rating?: number;
  rating_count?: number;
  status: 'pending' | 'approved' | 'rejected';
  created_by?: number;
  created_at: string;
}

export interface ProductFormData {
  nom: string;
  prix: string;
  image: string;
  description: string;
  stock: string;
}

export interface ProductFilters {
  search: string;
  status?: 'pending' | 'approved' | 'rejected';
  is_active?: boolean;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface ProductUpdateData {
  id: number;
  nom?: string;
  prix?: number;
  image?: string;
  description?: string;
  stock?: number;
  is_active?: boolean;
}

export interface OfflineProductCreateData {
  nom: string;
  prix: number;
  image?: string;
  description?: string;
  stock?: number;
  created_by?: number;
}