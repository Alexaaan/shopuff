// Product types
export interface Product {
  id: number;
  nom: string;
  description: string;
  prix: number;
  image: string;
  stock: number;
  is_active: boolean;
  created_at?: string;
  category_id?: number;
}

export interface ProductRating {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface OfflineProduct {
  id: number;
  nom: string;
  description: string;
  prix: number;
  image?: string;
  stock: number;
  status: 'pending' | 'approved' | 'rejected';
  user_id?: number;
  created_by?: number;
  created_at: string;
  average_rating?: number;
  rating_count?: number;
  users?: {
    nom: string;
    prenom: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantite: number;
  prix_unitaire: number;
  products?: Product;
}

export interface ProductFilters {
  search: string;
  is_active?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface ProductUpdateData {
  id: number;
  nom?: string;
  description?: string;
  prix?: number;
  stock?: number;
  is_active?: boolean;
}

export interface OfflineProductCreateData {
  nom: string;
  description?: string;
  prix: number;
  image?: string;
  stock: number;
  created_by?: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface ProductFormData {
  nom: string;
  prix: string;
  image: string;
  description: string;
  stock: string;
}
