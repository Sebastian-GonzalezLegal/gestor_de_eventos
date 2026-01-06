import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Vecinos from './components/Vecinos';
import Eventos from './components/Eventos';
import RegistroEvento from './components/RegistroEvento';
import Subsecretarias from './components/Subsecretarias';
import Tipos from './components/Tipos';
import Subtipos from './components/Subtipos';
import Usuarios from './components/Usuarios';
import WelcomeScreen from './components/WelcomeScreen';
import { UserProvider, useUser } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Componente para proteger rutas
const ProtectedRoute = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Componente para rutas públicas (solo accesibles sin autenticación)
const PublicRoute = ({ children, user }) => {
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <NotificationProvider>
      <UserProvider>
        <div className="App">
          <AppContent />
        </div>
      </UserProvider>
    </NotificationProvider>
  );
}

function AppContent() {
  const { user, loading, login, logout } = useUser();
  const [showWelcome, setShowWelcome] = useState(false);

  // Custom login handler to show welcome screen
  const handleLogin = (userData) => {
    setShowWelcome(true);
    // Don't call login immediately to context to prevent immediate redirect/render of dashboard
    // But we need the user data for the welcome screen
    // Actually, we can call login, but we need to overlay the welcome screen
    login(userData);
  };

  const handleWelcomeFinished = () => {
    setShowWelcome(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <>
      {showWelcome && user && (
        <WelcomeScreen user={user} onFinished={handleWelcomeFinished} />
      )}
      
      {/* 
        Si se muestra el welcome screen, ocultamos el contenido principal o lo dejamos de fondo
        Para una transición más suave, lo dejamos de fondo pero el WelcomeScreen tiene z-index alto
      */}
      
      {user && !showWelcome && <Navbar user={user} onLogout={logout} />}
      
      <div className="container" style={showWelcome ? { opacity: 0 } : { opacity: 1, transition: 'opacity 0.5s' }}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute user={user}>
                <Login onLogin={handleLogin} />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute user={user}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registro"
            element={
              <ProtectedRoute user={user}>
                <RegistroEvento />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vecinos"
            element={
              <ProtectedRoute user={user}>
                <Vecinos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventos"
            element={
              <ProtectedRoute user={user}>
                <Eventos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subsecretarias"
            element={
              <ProtectedRoute user={user}>
                <Subsecretarias />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tipos"
            element={
              <ProtectedRoute user={user}>
                <Tipos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subtipos"
            element={
              <ProtectedRoute user={user}>
                <Subtipos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute user={user}>
                <Usuarios />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
