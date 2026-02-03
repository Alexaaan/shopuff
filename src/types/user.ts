// User types
export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface UserDevice {
  id: number;
  user_id: number;
  device_token: string;
  platform: 'web' | 'ios' | 'android';
  created_at: string;
}

export interface AuthUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'user';
}
