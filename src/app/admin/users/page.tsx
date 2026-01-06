'use client';
import { useEffect, useState } from 'react';
interface User {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  role: string;
  is_active: boolean;
}
export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    secret_code: '',
    role: 'user'
  });
  useEffect(() => {
    loadUsers();
  }, []);
  async function loadUsers() {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }
  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (response.ok) {
        alert('Utilisateur créé');
        setForm({ nom: '', prenom: '', telephone: '', secret_code: '', role: 'user' });
        loadUsers();
      } else {
        alert('Erreur');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }
  return (
    <div className="admin-users">
      <h1>Gestion des Utilisateurs</h1>
      <form onSubmit={createUser} className="user-form">
        <input
          type="text"
          placeholder="Nom"
          value={form.nom}
          onChange={(e) => setForm({ ...form, nom: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Prénom"
          value={form.prenom}
          onChange={(e) => setForm({ ...form, prenom: e.target.value })}
          required
        />
        <input
          type="tel"
          placeholder="Téléphone"
          value={form.telephone}
          onChange={(e) => setForm({ ...form, telephone: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Code secret"
          value={form.secret_code}
          onChange={(e) => setForm({ ...form, secret_code: e.target.value })}
          required
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="btn">Créer Utilisateur</button>
      </form>
      <h2>Utilisateurs Existants</h2>
      <ul className="users-list">
        {users.map((user) => (
          <li key={user.id}>
            {user.nom} {user.prenom} - {user.telephone} - {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
}