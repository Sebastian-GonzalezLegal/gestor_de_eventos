import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Vecinos from './components/Vecinos';
import Eventos from './components/Eventos';
import RegistroEvento from './components/RegistroEvento';
import Subsecretarias from './components/Subsecretarias';
import Tipos from './components/Tipos';
import Subtipos from './components/Subtipos';

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/registro" replace />} />
          <Route path="/registro" element={<RegistroEvento />} />
          <Route path="/vecinos" element={<Vecinos />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/subsecretarias" element={<Subsecretarias />} />
          <Route path="/tipos" element={<Tipos />} />
          <Route path="/subtipos" element={<Subtipos />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
