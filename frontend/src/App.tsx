import { BrowserRouter, Routes as RouterRoutes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Home } from './pages/Home/Home';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { DriverDashboard } from './pages/Dashboard/DriverDashboard';
import { Routes } from './pages/Routes/Routes';
import { DriverRoutes } from './pages/DriverRoutes/DriverRoutes';
import Trucks from './pages/Trucks/Trucks';
import Trailers from './pages/Trailers/Trailers';
import Tires from './pages/Tires/Tires';
import Maintenance from './pages/Maintenance/Maintenance';
import MaintenanceRules from './pages/Maintenance/MaintenanceRules';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <RouterRoutes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/driver-dashboard" element={<DriverDashboard />} />
              <Route path="/trucks" element={<Trucks />} />
              <Route path="/trailers" element={<Trailers />} />
              <Route path="/tires" element={<Tires />} />
              <Route path="/routes" element={<Routes />} />
              <Route path="/driver-routes" element={<DriverRoutes />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/maintenance-rules" element={<MaintenanceRules />} />
            </Route>
          </RouterRoutes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}

export default App;
