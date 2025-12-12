import { Link } from 'react-router-dom';
import { Truck, Package, Route as RouteIcon, Wrench, BarChart3, CheckCircle2 } from 'lucide-react';

export const Home = () => {
  const features = [
    {
      icon: <Truck className="w-12 h-12 text-blue-600" />,
      title: 'Gestion des Camions',
      description: 'Gérez votre flotte de camions avec suivi en temps réel de l\'état et de la maintenance.'
    },
    {
      icon: <Package className="w-12 h-12 text-blue-600" />,
      title: 'Gestion des Remorques',
      description: 'Suivi complet des remorques incluant les pneus et l\'état général.'
    },
    {
      icon: <RouteIcon className="w-12 h-12 text-blue-600" />,
      title: 'Gestion des Routes',
      description: 'Planifiez et suivez vos itinéraires avec calcul automatique de la consommation.'
    },
    {
      icon: <Wrench className="w-12 h-12 text-blue-600" />,
      title: 'Maintenance Intelligente',
      description: 'Système de maintenance préventive avec alertes automatiques.'
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-blue-600" />,
      title: 'Rapports & Statistiques',
      description: 'Tableaux de bord détaillés pour analyser la performance de votre flotte.'
    }
  ];

  const benefits = [
    'Réduction des coûts de maintenance',
    'Optimisation de la consommation de carburant',
    'Suivi en temps réel de votre flotte',
    'Planification efficace des routes',
    'Alertes automatiques de maintenance',
    'Rapports détaillés et exportables'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Truck className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">TruckManager</h1>
          </div>
          <Link
            to="/login"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Se connecter
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Gérez votre flotte de transport efficacement
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          TruckManager est la solution complète pour la gestion de votre flotte de camions, 
          remorques, routes et maintenance. Optimisez vos opérations et réduisez vos coûts.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
          >
            Commencer maintenant
          </Link>
          <a
            href="#features"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition text-lg font-semibold"
          >
            En savoir plus
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Fonctionnalités principales
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
                <div className="mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Pourquoi choisir TruckManager ?
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Prêt à optimiser votre flotte ?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des centaines d'entreprises qui font confiance à TruckManager 
            pour gérer leur flotte de transport.
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition text-lg font-semibold"
          >
            Démarrer gratuitement
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Truck className="w-6 h-6" />
            <span className="text-xl font-bold">TruckManager</span>
          </div>
          <p className="text-gray-400">
            © 2025 TruckManager. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};
