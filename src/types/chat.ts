// Chat types
export interface Message {
  id: number;
  client_id?: string;
  message: string;
  created_at: string;
  user_id: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  order_id?: number;
  users?: {
    id: number;
    nom: string;
    prenom: string;
  };
}

export interface ChatPresence {
  id: number;
  user_id: number;
  order_id: number;
  is_active: boolean;
  last_seen_at: string;
}

export interface ChatOrder {
  id: number;
  utilisateur_id: number;
  statut: string;
  debut_commande: string;
  total: number;
  users: {
    nom: string;
    prenom: string;
  };
  order_products: {
    quantite: number;
    prix_unitaire: number;
    products: {
      nom: string;
    };
  }[];
}
