// Order types
export type OrderStatus =
  | 'en_attente'
  | 'validee'
  | 'en_preparation'
  | 'prete'
  | 'recuperee'
  | 'annulee';

export interface Order {
  id: number;
  utilisateur_id: number;
  statut: OrderStatus;
  total: number;
  debut_commande: string;
  fin_commande?: string;
  users?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    adresse?: string;
  };
  order_products?: OrderProduct[];
}

export interface OrderProduct {
  id: number;
  order_id: number;
  product_id: number;
  quantite: number;
  prix_unitaire: number;
  products?: {
    id: number;
    nom: string;
    image: string;
  };
}

export interface CreateOrderData {
  utilisateur_id: number;
  products: Array<{
    product_id: number;
    quantite: number;
  }>;
}

export interface UpdateOrderData {
  id: number;
  statut?: OrderStatus;
}
