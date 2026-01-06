import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaCog,
  FaChevronDown,
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
  FaSearch,
  FaBars,
  FaTimes,
  FaSpinner,
  FaBuilding,
  FaTags,
  FaTag,
  FaSignOutAlt,
  FaUserCircle,
  FaUserCog
} from 'react-icons/fa';
import { vecinosAPI, eventosAPI, registrosAPI, subsecretariasAPI, tiposAPI, subtiposAPI } from '../services/api';
import { formatDate } from '../utils/dateUtils';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const configMenuTimeoutRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Cerrar resultados de búsqueda y menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Solo cerrar si el clic no es dentro del contenedor de búsqueda
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        // Verificar que no sea un clic en elementos del menú de configuración o usuario
        const target = event.target;
        const isConfigMenuClick = target.closest('.dropdown-toggle') ||
                                 target.closest('.dropdown-menu') ||
                                 target.closest('.dropdown-item');
        const isUserMenuClick = target.closest('.user-profile-btn') ||
                               target.closest('.user-dropdown');

        if (!isConfigMenuClick) {
          setShowSearchResults(false);
        }

        if (!isUserMenuClick) {
          setShowUserMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función de búsqueda global
  const performGlobalSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);

      // Buscar en múltiples endpoints simultáneamente
      const [vecinosRes, eventosRes, registrosRes, subsecretariasRes, tiposRes, subtiposRes] = await Promise.allSettled([
        vecinosAPI.search(query),
        eventosAPI.getActive(), // Usar eventos activos que es más eficiente
        registrosAPI.getAll(), // Similar para registros
        subsecretariasAPI.getAll(), // Traemos todas las subsecretarias y filtramos en frontend
        tiposAPI.getAll(), // Traemos todos los tipos y filtramos en frontend
        subtiposAPI.getAll() // Traemos todos los subtipos y filtramos en frontend
      ]);

      const results = [];

      // Procesar resultados de vecinos
      if (vecinosRes.status === 'fulfilled') {
          const vecinos = vecinosRes.value.data.slice(0, 3); // Limitar a 3 resultados
        results.push(...vecinos.map(vecino => ({
          id: vecino.id_vecino,
          type: 'vecino',
          title: `${vecino.nombre} ${vecino.apellido}`,
          subtitle: `DNI: ${vecino.documento}`,
          icon: <FaUsers />,
          path: '/vecinos'
        })));
      }

      // Procesar resultados de eventos (filtrado básico por título)
      if (eventosRes.status === 'fulfilled') {
        const eventos = eventosRes.value.data
          .filter(evento => {
            // Mostrar todos los eventos si no hay query, o filtrar si hay query
            if (!query.trim()) return true;
            return evento.titulo?.toLowerCase().includes(query.toLowerCase()) ||
                   evento.nombre?.toLowerCase().includes(query.toLowerCase());
          })
          .slice(0, 2);
        results.push(...eventos.map(evento => {
          // Intentar diferentes nombres de campos para la fecha
          const fecha = evento.fecha || evento.fecha_evento || evento.fecha_inicio || evento.date;
          return {
            id: evento.id_evento,
            type: 'evento',
            title: evento.titulo || evento.nombre || 'Evento sin título',
            subtitle: `Fecha: ${formatDate(fecha)}`,
            icon: <FaCalendarAlt />,
            path: '/eventos'
          };
        }));
      }

      // Procesar resultados de registros (filtrado básico)
      if (registrosRes.status === 'fulfilled') {
        const registros = registrosRes.value.data
          .filter(registro => {
            // Filtrar por vecino, evento o fecha
            const vecinoNombre = registro.vecino?.nombre || '';
            const vecinoApellido = registro.vecino?.apellido || '';
            const eventoTitulo = registro.evento?.titulo || '';
            return vecinoNombre.toLowerCase().includes(query.toLowerCase()) ||
                   vecinoApellido.toLowerCase().includes(query.toLowerCase()) ||
                   eventoTitulo.toLowerCase().includes(query.toLowerCase());
          })
          .slice(0, 2); // Limitar a 2 resultados
        results.push(...registros.map(registro => ({
          id: registro.id_registro,
          type: 'registro',
          title: `${registro.vecino?.nombre} ${registro.vecino?.apellido}`,
          subtitle: `Evento: ${registro.evento?.titulo}`,
          icon: <FaClipboardList />,
          path: '/registro'
        })));
      }

      // Procesar resultados de subsecretarias (filtrado en frontend)
      if (subsecretariasRes.status === 'fulfilled') {
        const subsecretarias = subsecretariasRes.value.data
          .filter(subsecretaria => subsecretaria.nombre?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 2); // Limitar a 2 resultados
        results.push(...subsecretarias.map(subsecretaria => ({
          id: subsecretaria.id_subsecretaria,
          type: 'subsecretaria',
          title: subsecretaria.nombre,
          subtitle: `Dependencia municipal`,
          icon: <FaBuilding />,
          path: '/subsecretarias'
        })));
      }

      // Procesar resultados de tipos (filtrado en frontend)
      if (tiposRes.status === 'fulfilled') {
        const tipos = tiposRes.value.data
          .filter(tipo => tipo.nombre?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 2); // Limitar a 2 resultados
        results.push(...tipos.map(tipo => ({
          id: tipo.id_tipo,
          type: 'tipo',
          title: tipo.nombre,
          subtitle: `Categoría principal`,
          icon: <FaTags />,
          path: '/tipos'
        })));
      }

      // Procesar resultados de subtipos (filtrado en frontend)
      if (subtiposRes.status === 'fulfilled') {
        const subtipos = subtiposRes.value.data
          .filter(subtipo => subtipo.nombre?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 2); // Limitar a 2 resultados
        results.push(...subtipos.map(subtipo => ({
          id: subtipo.id_subtipo,
          type: 'subtipo',
          title: subtipo.nombre,
          subtitle: `Subcategoría`,
          icon: <FaTag />,
          path: '/subtipos'
        })));
      }

      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } catch (error) {
      console.error('Error en búsqueda global:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce para evitar búsquedas excesivas
    searchTimeoutRef.current = setTimeout(() => {
      performGlobalSearch(value);
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      performGlobalSearch(searchTerm);
    }
  };

  const handleResultClick = (path) => {
    navigate(path);
    setShowSearchResults(false);
    setSearchTerm('');
    closeMenus();
  }

  const closeMenus = () => {
    setShowConfigMenu(false);
    setShowMobileMenu(false);
    setShowUserMenu(false);
  };

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
    // Cerrar otros menús
    setShowConfigMenu(false);
    setShowMobileMenu(false);
    setShowSearchResults(false);
  };

  const handleConfigMouseEnter = () => {
    if (configMenuTimeoutRef.current) {
      clearTimeout(configMenuTimeoutRef.current);
    }
    setShowConfigMenu(true);
  };

  const handleConfigMouseLeave = () => {
    configMenuTimeoutRef.current = setTimeout(() => {
      setShowConfigMenu(false);
    }, 300);
  };

  const isActive = (path) => location.pathname === path;
  const isConfigActive = () => ['/subsecretarias', '/tipos', '/subtipos', '/usuarios'].includes(location.pathname);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo y título */}
        <Link to="/" className="navbar-brand-section" onClick={closeMenus}>
          <div className="navbar-logo-wrapper">
            <div className="logo-container">
              <img
                src="/logo_sin_fondo_logo.png"
                alt="Logo Municipio de Tigre"
                className="navbar-logo-main"
              />
            </div>
          </div>
        </Link>

        {/* Búsqueda integrada */}
        <div className="navbar-search" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="navbar-search-wrapper">
              <input
                type="text"
                placeholder="Buscar en la página"
                value={searchTerm}
                onChange={handleSearchChange}
                className="navbar-search-input"
              />
              {searchLoading ? (
                <FaSpinner className="navbar-search-icon spinning" />
              ) : (
                <FaSearch className="navbar-search-icon" />
              )}
            </div>
          </form>

          {/* Resultados de búsqueda */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              <div className="search-results-header">
                Resultados encontrados ({searchResults.length})
              </div>
              <div className="search-results-list">
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    className="search-result-item"
                    onClick={() => handleResultClick(result.path)}
                  >
                    <div className="search-result-icon">
                      {result.icon}
                    </div>
                    <div className="search-result-content">
                      <div className="search-result-title">{result.title}</div>
                      <div className="search-result-subtitle">{result.subtitle}</div>
                    </div>
                    <div className="search-result-type">{result.type}</div>
                  </button>
                ))}
              </div>
              {searchResults.length >= 5 && (
                <div className="search-results-footer">
                  <button
                    className="search-see-more"
                    onClick={() => {
                      setShowSearchResults(false);
                      setSearchTerm('');
                    }}
                  >
                    Cerrar resultados
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navegación principal */}
        <div className="navbar-navigation">
          <div className="navbar-tabs">
            <Link
              to="/"
              className={`navbar-tab ${isActive('/') ? 'active' : ''}`}
              onClick={closeMenus}
            >
              <FaHome />
              <span className="tab-text">Inicio</span>
            </Link>
            <Link
              to="/registro"
              className={`navbar-tab ${isActive('/registro') ? 'active' : ''}`}
              onClick={closeMenus}
            >
              <FaClipboardList />
              <span className="tab-text">Registro</span>
            </Link>
            <Link
              to="/vecinos"
              className={`navbar-tab ${isActive('/vecinos') ? 'active' : ''}`}
              onClick={closeMenus}
            >
              <FaUsers />
              <span className="tab-text">Vecinos</span>
            </Link>
            <Link
              to="/eventos"
              className={`navbar-tab ${isActive('/eventos') ? 'active' : ''}`}
              onClick={closeMenus}
            >
              <FaCalendarAlt />
              <span className="tab-text">Eventos</span>
            </Link>
            <div
              className="dropdown"
              onMouseEnter={handleConfigMouseEnter}
              onMouseLeave={handleConfigMouseLeave}
            >
              <button
                className={`navbar-tab dropdown-toggle ${isConfigActive() ? 'active' : ''}`}
                onClick={() => setShowConfigMenu(!showConfigMenu)}
              >
                <FaCog />
                <span className="tab-text">Configuración</span>
                <FaChevronDown className={`chevron ${showConfigMenu ? 'rotated' : ''}`} />
              </button>
              {showConfigMenu && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">Administración</div>
                  <Link
                    to="/subsecretarias"
                    className={`dropdown-item ${isActive('/subsecretarias') ? 'active' : ''}`}
                    onClick={closeMenus}
                  >
                    <div className="dropdown-icon-wrapper"><FaBuilding /></div>
                    <div className="dropdown-item-content">
                      <span className="dropdown-item-title">Subsecretarías</span>
                      <span className="dropdown-item-desc">Dependencias</span>
                    </div>
                  </Link>
                  <Link
                    to="/tipos"
                    className={`dropdown-item ${isActive('/tipos') ? 'active' : ''}`}
                    onClick={closeMenus}
                  >
                    <div className="dropdown-icon-wrapper"><FaTags /></div>
                    <div className="dropdown-item-content">
                      <span className="dropdown-item-title">Tipos</span>
                      <span className="dropdown-item-desc">Categorías</span>
                    </div>
                  </Link>
                  <Link
                    to="/subtipos"
                    className={`dropdown-item ${isActive('/subtipos') ? 'active' : ''}`}
                    onClick={closeMenus}
                  >
                    <div className="dropdown-icon-wrapper"><FaTag /></div>
                    <div className="dropdown-item-content">
                      <span className="dropdown-item-title">Subtipos</span>
                      <span className="dropdown-item-desc">Subcategorías</span>
                    </div>
                  </Link>
                  <Link
                    to="/usuarios"
                    className={`dropdown-item ${isActive('/usuarios') ? 'active' : ''}`}
                    onClick={closeMenus}
                  >
                    <div className="dropdown-icon-wrapper"><FaUserCog /></div>
                    <div className="dropdown-item-content">
                      <span className="dropdown-item-title">Usuarios</span>
                      <span className="dropdown-item-desc">Gestión de usuarios</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="navbar-user">
            {user ? (
              <div className="user-menu-container">
                <button className="user-profile-btn" onClick={handleUserMenuClick}>
                  <FaUserCircle className="user-avatar" />
                  <span className="user-name">{user.nombre}</span>
                  <FaChevronDown className={`user-chevron ${showUserMenu ? 'rotated' : ''}`} />
                </button>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <div className="user-info-name">{user.nombre}</div>
                      <div className="user-info-email">{user.email}</div>
                      <div className="user-info-role">
                        {user.rol === 'admin' ? 'Administrador' :
                         user.rol === 'visitante' ? 'Visitante' : 'Usuario'}
                      </div>
                    </div>
                    <div className="user-divider"></div>
                    <button
                      className="user-logout-btn"
                      onClick={() => {
                        onLogout();
                        setShowUserMenu(false);
                      }}
                    >
                      <FaSignOutAlt />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="user-placeholder">
                <FaUserCircle className="user-avatar" />
              </div>
            )}
          </div>
        </div>

        {/* Botón menú móvil */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Toggle menu"
        >
          {showMobileMenu ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Overlay para cerrar menús */}
      <div className={`navbar-overlay ${(showMobileMenu) ? 'active' : ''}`} onClick={closeMenus}></div>

      {/* Menú móvil */}
      <div className={`mobile-menu ${showMobileMenu ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-brand">
             <span className="brand-accent">TIGRE</span> MUNICIPIO
          </div>
          <button className="mobile-close-btn" onClick={closeMenus}><FaTimes /></button>
        </div>

        <div className="mobile-menu-content">
          <div className="mobile-section-title">Principal</div>
          <Link
            to="/"
            className={`mobile-menu-item ${isActive('/') ? 'active' : ''}`}
            onClick={closeMenus}
          >
            <div className="mobile-menu-item-icon"><FaHome /></div>
            <div className="mobile-menu-item-content">
              <div className="mobile-menu-item-title">Inicio</div>
            </div>
          </Link>
          <Link
            to="/registro"
            className={`mobile-menu-item ${isActive('/registro') ? 'active' : ''}`}
            onClick={closeMenus}
          >
            <div className="mobile-menu-item-icon"><FaClipboardList /></div>
            <div className="mobile-menu-item-content">
              <div className="mobile-menu-item-title">Registro</div>
            </div>
          </Link>

          <Link
            to="/vecinos"
            className={`mobile-menu-item ${isActive('/vecinos') ? 'active' : ''}`}
            onClick={closeMenus}
          >
            <div className="mobile-menu-item-icon"><FaUsers /></div>
            <div className="mobile-menu-item-content">
              <div className="mobile-menu-item-title">Vecinos</div>
            </div>
          </Link>

          <Link
            to="/eventos"
            className={`mobile-menu-item ${isActive('/eventos') ? 'active' : ''}`}
            onClick={closeMenus}
          >
            <div className="mobile-menu-item-icon"><FaCalendarAlt /></div>
            <div className="mobile-menu-item-content">
              <div className="mobile-menu-item-title">Eventos</div>
            </div>
          </Link>

          <div className="mobile-divider"></div>
          <div className="mobile-section-title">Configuración</div>

          <Link
            to="/subsecretarias"
            className={`mobile-menu-item ${isActive('/subsecretarias') ? 'active' : ''}`}
            onClick={closeMenus}
          >
            <div className="mobile-menu-item-icon"><FaBuilding /></div>
            <div className="mobile-menu-item-content">
              <div className="mobile-menu-item-title">Subsecretarías</div>
            </div>
          </Link>

          <Link
            to="/tipos"
            className={`mobile-menu-item ${isActive('/tipos') ? 'active' : ''}`}
            onClick={closeMenus}
          >
            <div className="mobile-menu-item-icon"><FaTags /></div>
            <div className="mobile-menu-item-content">
              <div className="mobile-menu-item-title">Tipos</div>
            </div>
          </Link>

          <Link
            to="/subtipos"
            className={`mobile-menu-item ${isActive('/subtipos') ? 'active' : ''}`}
            onClick={closeMenus}
          >
            <div className="mobile-menu-item-icon"><FaTag /></div>
            <div className="mobile-menu-item-content">
              <div className="mobile-menu-item-title">Subtipos</div>
            </div>
          </Link>

          <Link
            to="/usuarios"
            className={`mobile-menu-item ${isActive('/usuarios') ? 'active' : ''}`}
            onClick={closeMenus}
          >
            <div className="mobile-menu-item-icon"><FaUserCog /></div>
            <div className="mobile-menu-item-content">
              <div className="mobile-menu-item-title">Usuarios</div>
            </div>
          </Link>
        </div>

        <div className="mobile-footer-actions">
             <button className="mobile-logout-btn" onClick={onLogout}>
                <FaSignOutAlt /> Cerrar Sesión
             </button>
          </div>
      </div>
    </nav>
  );
};

export default Navbar;
