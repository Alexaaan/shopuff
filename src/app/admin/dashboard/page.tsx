export default function Dashboard() {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="keypad-grid">
        <a href="/admin/products" className="keypad-btn">
          📦<br />Produits
        </a>
        <a href="/admin/users" className="keypad-btn">
          👥<br />Utilisateurs
        </a>
        <a href="/admin/orders" className="keypad-btn">
          📋<br />Commandes
        </a>
        <a href="/admin/chats" className="keypad-btn">
          💬<br />Chat Commande
        </a>
        <a href="/admin/stats" className="keypad-btn">
          📊<br />Statistiques
        </a>
      </div>
    </div>
  );
}