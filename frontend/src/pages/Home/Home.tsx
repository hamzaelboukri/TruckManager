import { Link } from 'react-router-dom';
import { 
  Truck, 
  Package, 
  Route as RouteIcon, 
  Wrench, 
  BarChart3, 
  CheckCircle2,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Clock,
  DollarSign
} from 'lucide-react';

export const Home = () => {
  const features = [
    {
      icon: <Truck className="w-12 h-12 text-blue-600" />,
      title: 'Gestion des Camions',
      description: 'Gérez votre flotte de camions avec suivi en temps réel de l\'état et de la maintenance.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Package className="w-12 h-12 text-purple-600" />,
      title: 'Gestion des Remorques',
      description: 'Suivi complet des remorques incluant les pneus et l\'état général.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <RouteIcon className="w-12 h-12 text-green-600" />,
      title: 'Gestion des Routes',
      description: 'Planifiez et suivez vos itinéraires avec calcul automatique de la consommation.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <Wrench className="w-12 h-12 text-orange-600" />,
      title: 'Maintenance Intelligente',
      description: 'Système de maintenance préventive avec alertes automatiques.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-indigo-600" />,
      title: 'Rapports & Statistiques',
      description: 'Tableaux de bord détaillés pour analyser la performance de votre flotte.',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: <Shield className="w-12 h-12 text-red-600" />,
      title: 'Sécurité & Conformité',
      description: 'Assurez la conformité réglementaire et la sécurité de vos opérations.',
      color: 'from-red-500 to-red-600'
    }
  ];

  const stats = [
    { icon: <Truck className="w-8 h-8" />, value: '500+', label: 'Camions gérés' },
    { icon: <Users className="w-8 h-8" />, value: '50+', label: 'Entreprises clientes' },
    { icon: <TrendingUp className="w-8 h-8" />, value: '30%', label: 'Réduction des coûts' },
    { icon: <Clock className="w-8 h-8" />, value: '24/7', label: 'Support disponible' }
  ];

  const benefits = [
    { icon: <DollarSign className="w-5 h-5" />, text: 'Réduction des coûts de maintenance' },
    { icon: <TrendingUp className="w-5 h-5" />, text: 'Optimisation de la consommation de carburant' },
    { icon: <Zap className="w-5 h-5" />, text: 'Suivi en temps réel de votre flotte' },
    { icon: <RouteIcon className="w-5 h-5" />, text: 'Planification efficace des routes' },
    { icon: <CheckCircle2 className="w-5 h-5" />, text: 'Alertes automatiques de maintenance' },
    { icon: <BarChart3 className="w-5 h-5" />, text: 'Rapports détaillés et exportables' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              TruckManager
            </h1>
          </div>
          <Link
            to="/login"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
          >
            Se connecter
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6 font-medium text-sm">
            <Zap className="w-4 h-4" />
            <span>Plateforme de gestion N°1</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Gérez votre flotte de <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              transport efficacement
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            TruckManager est la solution complète pour la gestion de votre flotte de camions, 
            remorques, routes et maintenance. Optimisez vos opérations et réduisez vos coûts jusqu'à 30%.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/login"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 text-lg font-semibold w-full sm:w-auto"
            >
              Commencer maintenant →
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-200 text-lg font-semibold w-full sm:w-auto"
            >
              En savoir plus
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-center border border-gray-100"
            >
              <div className="inline-flex p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-3 text-blue-600">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Fonctionnalités principales
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer votre flotte efficacement
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2"
              >
                <div className={`inline-flex p-4 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 text-white shadow-lg`}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Pourquoi choisir TruckManager ?
              </h3>
              <p className="text-xl text-gray-600">
                Des résultats concrets pour votre entreprise
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
                >
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                    {benefit.icon}
                  </div>
                  <span className="text-gray-800 font-medium text-lg pt-2">
                    {benefit.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à optimiser votre flotte ?
          </h3>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Rejoignez plus de 50 entreprises qui font confiance à TruckManager 
            pour gérer leur flotte de transport et réduire leurs coûts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 text-lg font-semibold"
            >
              Démarrer gratuitement
              <Zap className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="inline-block px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white/10 transition-all duration-200 text-lg font-semibold"
            >
              Voir une démo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">TruckManager</span>
            </div>
            
            <div className="flex flex-wrap gap-6 mb-6 md:mb-0 text-gray-400">
              <a href="#features" className="hover:text-white transition">Fonctionnalités</a>
              <a href="#" className="hover:text-white transition">Tarifs</a>
              <a href="#" className="hover:text-white transition">À propos</a>
              <a href="#" className="hover:text-white transition">Contact</a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 TruckManager. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
