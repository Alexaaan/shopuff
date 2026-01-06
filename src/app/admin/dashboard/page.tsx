export default function Dashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin panel.</p>
      <div className="dashboard-card">
        <h2>📦 Gestion des Produits</h2>
        <p>Gérer le stock et les informations des produits</p>
        <a href="/admin/products" className="btn">Accéder à la Gestion des Produits</a>
      </div>
      <div className="dashboard-card">
        <h2>👥 Gestion des Utilisateurs</h2>
        <p>Créer de nouveaux utilisateurs et gérer les comptes existants</p>
        <button className="btn">Créer un Utilisateur</button>
        <a href="/admin/users" className="btn secondary">Voir les Utilisateurs</a>
      </div>
      <div className="dashboard-card">
        <h2>📋 Gestion des Commandes</h2>
        <p>Gérer et valider les commandes</p>
        <button className="btn">Valider une Commande</button>
        <a href="/admin/orders" className="btn secondary">Voir les Commandes</a>
      </div>
      <div className="dashboard-card">
        <h2>📊 Statistiques</h2>
        <p>Consulter les statistiques du site</p>
        <a href="/admin/stats" className="btn">Voir les Statistiques</a>
      </div>
    </div>
  );
}