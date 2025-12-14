import { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Route as RouteIcon,
  LogOut,
  Truck
} from 'lucide-react';

interface DriverLayoutProps {
  children: ReactNode;
}

export const DriverLayout = ({ children }: DriverLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { 
      name: 'Tableau de Bord', 
      href: '/driver-dashboard', 
      icon: Home 
    },
    { 
      name: 'Mes Routes', 
      href: '/driver-routes', 
      icon: RouteIcon 
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">TruckManager</h1>
                <p className="text-xs text-blue-100">Espace Chauffeur</p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{user?.name || user?.email}</p>
                <p className="text-xs text-blue-100">Chauffeur</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Navigation */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap gap-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main>{children}</main>
      </div>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 TruckManager - Espace Chauffeur</p>
            <p className="mt-1">Pour toute assistance, contactez votre superviseur</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
