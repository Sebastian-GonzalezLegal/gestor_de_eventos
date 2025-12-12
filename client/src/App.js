import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Vecinos from './components/Vecinos';
import Eventos from './components/Eventos';
import RegistroEvento from './components/RegistroEvento';
import Subsecretarias from './components/Subsecretarias';
import Tipos from './components/Tipos';
import Subtipos from './components/Subtipos';
import Usuarios from './components/Usuarios';
import { UserProvider, useUser } from './contexts/UserContext';

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
    return <Navigate to="/registro" replace />;
  }
  return children;
};

function App() {
  return (
    <UserProvider>
      <div className="App">
        <AppContent />
      </div>
    </UserProvider>
  );
}

function AppContent() {
  const { user, loading, login, logout } = useUser();

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
      {user && <Navbar user={user} onLogout={logout} />}
      <div className="container">
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute user={user}>
                <Login onLogin={login} />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              user ? <Navigate to="/registro" replace /> : <Navigate to="/login" replace />
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
