import React, { useState, useEffect, useRef } from 'react';
import {
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
  FaTag
} from 'react-icons/fa';
import { vecinosAPI, eventosAPI, registrosAPI, subsecretariasAPI, tiposAPI, subtiposAPI } from '../services/api';
import './Navbar.css';

const Navbar = ({ activeTab, setActiveTab, stats = {} }) => {
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Cerrar resultados de búsqueda al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Solo cerrar si el clic no es dentro del contenedor de búsqueda
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        // Verificar que no sea un clic en elementos del menú de configuración
        const target = event.target;
        const isConfigMenuClick = target.closest('.dropdown-toggle') ||
                                 target.closest('.dropdown-menu') ||
                                 target.closest('.dropdown-item');

        if (!isConfigMenuClick) {
          setShowSearchResults(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función para formatear fechas de manera segura
  const formatDate = (dateInput) => {
    if (!dateInput) return 'Sin fecha';

    try {
      let date;

      // Si es un string, intentar parsearlo
      if (typeof dateInput === 'string') {
        // Intentar diferentes formatos comunes
        const formats = [
          dateInput, // formato original
          dateInput.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'), // DD/MM/YYYY -> YYYY-MM-DD
          dateInput.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'), // DD-MM-YYYY -> YYYY-MM-DD
        ];

        for (const format of formats) {
          date = new Date(format);
          if (!isNaN(date.getTime())) break;
        }
      } else {
        // Si no es string, intentar convertirlo directamente
        date = new Date(dateInput);
      }

      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }

      return date.toLocaleDateString('es-ES');
    } catch (error) {
      return 'Fecha inválida';
    }
  };

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
          onClick: () => {
            setActiveTab('vecinos');
            setShowSearchResults(false);
            setSearchTerm('');
          }
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
            onClick: () => {
              setActiveTab('eventos');
              setShowSearchResults(false);
              setSearchTerm('');
            }
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
          onClick: () => {
            setActiveTab('registro');
            setShowSearchResults(false);
            setSearchTerm('');
          }
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
          onClick: () => {
            setActiveTab('subsecretarias');
            setShowSearchResults(false);
            setSearchTerm('');
          }
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
          onClick: () => {
            setActiveTab('tipos');
            setShowSearchResults(false);
            setSearchTerm('');
          }
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
          onClick: () => {
            setActiveTab('subtipos');
            setShowSearchResults(false);
            setSearchTerm('');
          }
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

  const closeMenus = () => {
    setShowConfigMenu(false);
    setShowMobileMenu(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo y título */}
        <div className="navbar-brand-section">
          <h1 className="navbar-brand">
            <span className="brand-accent">TIGRE</span> MUNICIPIO
          </h1>
          <div className="brand-subtitle">Sistema de Gestión Municipal</div>
        </div>

        {/* Búsqueda integrada */}
        <div className="navbar-search" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Buscar en todo el sistema..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              {searchLoading ? (
                <FaSpinner className="search-icon spinning" />
              ) : (
                <FaSearch className="search-icon" />
              )}
            </div>
          </form>

          {/* Resultados de búsqueda */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              <div className="search-results-header">
                Resultados de búsqueda
              </div>
              {searchResults.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  className="search-result-item"
                  onClick={result.onClick}
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
              {searchResults.length >= 5 && (
                <div className="search-results-footer">
                  <button
                    className="search-see-more"
                    onClick={() => {
                      // Aquí podrías navegar a una página de resultados completa
                      setShowSearchResults(false);
                      setSearchTerm('');
                    }}
                  >
                    Ver todos los resultados
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navegación principal */}
        <div className="navbar-navigation">
          <div className="navbar-tabs">
            <button
              className={`navbar-tab ${activeTab === 'registro' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('registro');
                closeMenus();
              }}
              title="Registro de Eventos"
            >
              <FaClipboardList />
              <span className="tab-text">Registro</span>
            </button>
            <button
              className={`navbar-tab ${activeTab === 'vecinos' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('vecinos');
                closeMenus();
              }}
              title="Gestión de Vecinos"
            >
              <FaUsers />
              <span className="tab-text">Vecinos</span>
            </button>
            <button
              className={`navbar-tab ${activeTab === 'eventos' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('eventos');
                closeMenus();
              }}
              title="Gestión de Eventos"
            >
              <FaCalendarAlt />
              <span className="tab-text">Eventos</span>
            </button>
            <div className="dropdown">
              <button
                className={`navbar-tab dropdown-toggle ${['subsecretarias', 'tipos', 'subtipos'].includes(activeTab) ? 'active' : ''}`}
                onClick={() => setShowConfigMenu(!showConfigMenu)}
                title="Configuraciones del Sistema"
              >
                <FaCog />
                <span className="tab-text">Configuración</span>
                <FaChevronDown className={`chevron ${showConfigMenu ? 'rotated' : ''}`} />
              </button>
              {showConfigMenu && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">Configuraciones</div>
                  <button
                    className={`dropdown-item ${activeTab === 'subsecretarias' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('subsecretarias');
                      closeMenus();
                    }}
                  >
                    <div className="dropdown-item-content">
                      <span className="dropdown-item-title">Subsecretarías</span>
                      <span className="dropdown-item-desc">Administrar dependencias</span>
                    </div>
                  </button>
                  <button
                    className={`dropdown-item ${activeTab === 'tipos' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('tipos');
                      closeMenus();
                    }}
                  >
                    <div className="dropdown-item-content">
                      <span className="dropdown-item-title">Tipos</span>
                      <span className="dropdown-item-desc">Categorías principales</span>
                    </div>
                  </button>
                  <button
                    className={`dropdown-item ${activeTab === 'subtipos' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('subtipos');
                      closeMenus();
                    }}
                  >
                    <div className="dropdown-item-content">
                      <span className="dropdown-item-title">Subtipos</span>
                      <span className="dropdown-item-desc">Subcategorías del sistema</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
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
      <div className={`navbar-overlay ${(showConfigMenu || showMobileMenu) ? 'active' : ''}`} onClick={closeMenus}></div>

      {/* Menú móvil */}
      <div className={`mobile-menu ${showMobileMenu ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <h3 className="mobile-menu-title">Menú</h3>
          <p className="mobile-menu-subtitle">Navegación principal</p>
        </div>

        <div className="mobile-menu-content">
          <button
            className={`mobile-menu-item ${activeTab === 'registro' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('registro');
              closeMenus();
            }}
          >
            <div className="mobile-menu-item-icon">
              <FaClipboardList />
            </div>
            <div className="mobile-menu-item-content">
              <div className="mobile-menu-item-title">Registro</div>
              <div className="mobile-menu-item-desc">Registro de eventos</div>
            </div>
          </button>

          <button
            className={`mobile-menu-item ${activeTab === 'vecinos' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('vecinos');
              closeMenus();
            }}
          >
            <div className="mobile-menu-item-icon">
              <FaUsers />
            </div>
            <div className="mobile-menu-item-content">
              <div className="mobile-menu-item-title">Vecinos</div>
              <div className="mobile-menu-item-desc">Gestión de vecinos</div>
            </div>
          </button>

          <button
            className={`mobile-menu-item ${activeTab === 'eventos' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('eventos');
              closeMenus();
            }}
          >
            <div className="mobile-menu-item-icon">
              <FaCalendarAlt />
            </div>
            <div className="mobile-menu-item-content">
              <div className="mobile-menu-item-title">Eventos</div>
              <div className="mobile-menu-item-desc">Gestión de eventos</div>
            </div>
          </button>

          <div style={{ height: '20px' }}></div>

          <button
            className={`mobile-menu-item ${activeTab === 'subsecretarias' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('subsecretarias');
              closeMenus();
            }}
          >
            <div className="mobile-menu-item-icon">
              <FaCog />
            </div>
            <div className="mobile-menu-item-content">
              <div className="mobile-menu-item-title">Subsecretarías</div>
              <div className="mobile-menu-item-desc">Administrar dependencias</div>
            </div>
          </button>

          <button
            className={`mobile-menu-item ${activeTab === 'tipos' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('tipos');
              closeMenus();
            }}
          >
            <div className="mobile-menu-item-icon">
              <FaCog />
            </div>
            <div className="mobile-menu-item-content">
              <div className="mobile-menu-item-title">Tipos</div>
              <div className="mobile-menu-item-desc">Categorías principales</div>
            </div>
          </button>

          <button
            className={`mobile-menu-item ${activeTab === 'subtipos' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('subtipos');
              closeMenus();
            }}
          >
            <div className="mobile-menu-item-icon">
              <FaCog />
            </div>
            <div className="mobile-menu-item-content">
              <div className="mobile-menu-item-title">Subtipos</div>
              <div className="mobile-menu-item-desc">Subcategorías del sistema</div>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
