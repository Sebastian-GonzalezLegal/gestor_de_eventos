import React, { useState } from 'react';
import { FaCog, FaChevronDown } from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ activeTab, setActiveTab }) => {
  const [showConfigMenu, setShowConfigMenu] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-brand">
          <span className="brand-accent">TIGRE</span> MUNICIPIO
        </h1>
        <div className="navbar-tabs">
          <button
            className={`navbar-tab ${activeTab === 'registro' ? 'active' : ''}`}
            onClick={() => setActiveTab('registro')}
          >
            Registro
          </button>
          <button
            className={`navbar-tab ${activeTab === 'vecinos' ? 'active' : ''}`}
            onClick={() => setActiveTab('vecinos')}
          >
            Vecinos
          </button>
          <button
            className={`navbar-tab ${activeTab === 'eventos' ? 'active' : ''}`}
            onClick={() => setActiveTab('eventos')}
          >
            Eventos
          </button>
          <div className="dropdown">
            <button
              className={`navbar-tab dropdown-toggle ${['subsecretarias', 'tipos', 'subtipos'].includes(activeTab) ? 'active' : ''}`}
              onClick={() => setShowConfigMenu(!showConfigMenu)}
            >
              <FaCog /> Configuración <FaChevronDown />
            </button>
            {showConfigMenu && (
              <div className="dropdown-menu">
                <button
                  className={`dropdown-item ${activeTab === 'subsecretarias' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('subsecretarias');
                    setShowConfigMenu(false);
                  }}
                >
                  Subsecretarías
                </button>
                <button
                  className={`dropdown-item ${activeTab === 'tipos' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('tipos');
                    setShowConfigMenu(false);
                  }}
                >
                  Tipos
                </button>
                <button
                  className={`dropdown-item ${activeTab === 'subtipos' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('subtipos');
                    setShowConfigMenu(false);
                  }}
                >
                  Subtipos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
