import React from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Home } from './pages/Home/Home';
import { Login } from './pages/Auth/Login';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Routes } from './pages/Routes/Routes';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <RouterRoutes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trucks" element={<Dashboard />} />
              <Route path="/trailers" element={<Dashboard />} />
              <Route path="/routes" element={<Routes />} />
              <Route path="/maintenance" element={<Dashboard />} />
            </Route>
          </RouterRoutes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}

export default App;
