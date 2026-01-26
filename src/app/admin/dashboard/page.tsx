import Link from "next/link";

export default function Dashboard() {
  const menuItems = [
    {
      href: "/admin/dashboard/products",
      icon: "📦",
      title: "Produits",
      description: "Gérer le catalogue",
      color: "from-purple-500 to-pink-500",
      glow: "shadow-purple-500/25"
    },
    {
      href: "/admin/dashboard/users",
      icon: "👥",
      title: "Utilisateurs",
      description: "Gestion des comptes",
      color: "from-blue-500 to-cyan-500",
      glow: "shadow-blue-500/25"
    },
    {
      href: "/admin/dashboard/orders",
      icon: "📋",
      title: "Commandes",
      description: "Suivi des ventes",
      color: "from-green-500 to-emerald-500",
      glow: "shadow-green-500/25"
    },
    {
      href: "/admin/dashboard/chats",
      icon: "💬",
      title: "Chat Commande",
      description: "Support client",
      color: "from-orange-500 to-red-500",
      glow: "shadow-orange-500/25"
    },
    {
      href: "/admin/dashboard/stats",
      icon: "📊",
      title: "Statistiques",
      description: "Analyses & rapports",
      color: "from-indigo-500 to-purple-500",
      glow: "shadow-indigo-500/25"
    },
    {
      href: "/admin/dashboard/notifications",
      icon: "🔔",
      title: "Notifications",
      description: "Push & alertes",
      color: "from-pink-500 to-rose-500",
      glow: "shadow-pink-500/25"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-pink-900/20 via-transparent to-transparent"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 cosmic-gradient-text glow-text">
            Admin Dashboard
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Centre de contrôle complet pour gérer votre plateforme Chicha
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {menuItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative overflow-hidden rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

              {/* Content */}
              <div className="relative p-8 text-center">
                {/* Icon */}
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                  {item.description}
                </p>

                {/* Hover Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-16 transition-all duration-300"></div>
              </div>

              {/* Animated Border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -m-0.5"></div>
            </Link>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-slate-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Système opérationnel</span>
          </div>
        </div>
      </div>
    </div>
  );
}