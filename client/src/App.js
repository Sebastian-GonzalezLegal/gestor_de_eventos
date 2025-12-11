import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Usuarios from './components/Usuarios';
import Eventos from './components/Eventos';
import RegistroEvento from './components/RegistroEvento';

function App() {
  const [activeTab, setActiveTab] = useState('registro');

  return (
    <div className="App">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="container">
        {activeTab === 'usuarios' && <Usuarios />}
        {activeTab === 'eventos' && <Eventos />}
        {activeTab === 'registro' && <RegistroEvento />}
      </div>
    </div>
  );
}

export default App;

