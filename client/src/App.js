import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Vecinos from './components/Vecinos';
import Eventos from './components/Eventos';
import RegistroEvento from './components/RegistroEvento';
import Subsecretarias from './components/Subsecretarias';
import Tipos from './components/Tipos';
import Subtipos from './components/Subtipos';

function App() {
  const [activeTab, setActiveTab] = useState('registro');
  const [stats, setStats] = useState({
    registrosPendientes: 0,
    totalVecinos: 0,
    eventosActivos: 0
  });

  // Simular carga de estadísticas (en producción vendría de una API)
  useEffect(() => {
    // Estadísticas de ejemplo - en producción se cargarían desde la API
    const loadStats = () => {
      setStats({
        registrosPendientes: Math.floor(Math.random() * 5), // 0-4 registros pendientes
        totalVecinos: Math.floor(Math.random() * 1000) + 500, // 500-1500 vecinos
        eventosActivos: Math.floor(Math.random() * 10) + 1 // 1-10 eventos activos
      });
    };

    loadStats();
    // Actualizar estadísticas cada 30 segundos
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />
      <div className="container">
        {activeTab === 'vecinos' && <Vecinos />}
        {activeTab === 'eventos' && <Eventos />}
        {activeTab === 'registro' && <RegistroEvento />}
        {activeTab === 'subsecretarias' && <Subsecretarias />}
        {activeTab === 'tipos' && <Tipos setActiveTab={setActiveTab} />}
        {activeTab === 'subtipos' && <Subtipos />}
      </div>
    </div>
  );
}

export default App;

