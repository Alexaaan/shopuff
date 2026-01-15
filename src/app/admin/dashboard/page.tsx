import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="keypad-grid">
        <Link href="/admin/dashboard/products" className="keypad-btn">
          📦<br />Produits
        </Link>
        <Link href="/admin/dashboard/users" className="keypad-btn">
          👥<br />Utilisateurs
        </Link>
        <Link href="/admin/dashboard/orders" className="keypad-btn">
          📋<br />Commandes
        </Link>
        <Link href="/admin/dashboard/chats" className="keypad-btn">
          💬<br />Chat Commande
        </Link>
        <Link href="/admin/dashboard/stats" className="keypad-btn">
          📊<br />Statistiques
        </Link>
      </div>
    </div>
  );
}