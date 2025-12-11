import React, { useState } from 'react';
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

  return (
    <div className="App">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
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

