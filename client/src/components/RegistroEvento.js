import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserCheck, FaArrowLeft, FaUsers, FaTimes, FaMapMarkerAlt, FaClock, FaBuilding, FaTag } from 'react-icons/fa';
import { registrosAPI, vecinosAPI, eventosAPI, subsecretariasAPI, tiposAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';
import './RegistroEvento.css';

const RegistroEvento = () => {
  const { isVisitor } = useUser();
  const [vecinos, setVecinos] = useState([]);
  const [allVecinos, setAllVecinos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [vecinoFilters, setVecinoFilters] = useState({ estado: 'todos' });
  const [vecinoEncontrado, setVecinoEncontrado] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [eventosVecino, setEventosVecino] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loadingVecinos, setLoadingVecinos] = useState(false);
  
  // Event Dropdown Filters
  const [eventFilters, setEventFilters] = useState({
    subsecretaria: '',
    tipo: ''
  });
  const [subsecretarias, setSubsecretarias] = useState([]);
  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
        setLoadingVecinos(true);
        const [eventosRes, vecinosRes, subsecretariasRes, tiposRes] = await Promise.all([
            eventosAPI.getActive(),
            vecinosAPI.getAll(),
            subsecretariasAPI.getAll(),
            tiposAPI.getAll()
        ]);
        setEventos(eventosRes.data);
        setAllVecinos(vecinosRes.data);
        setVecinos(vecinosRes.data);
        setSubsecretarias(subsecretariasRes.data);
        setTipos(tiposRes.data);
    } catch (error) {
        showAlert('Error al cargar datos iniciales', 'error');
    } finally {
        setLoadingVecinos(false);
    }
  };

  // Filter Neighbors
  useEffect(() => {
    let result = allVecinos;

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(v => 
        v.nombre.toLowerCase().includes(lowerTerm) ||
        v.apellido.toLowerCase().includes(lowerTerm) ||
        v.documento.includes(lowerTerm)
      );
    }

    if (vecinoFilters.estado !== 'todos') {
        result = result.filter(v => {
            if (vecinoFilters.estado === 'activos') return v.activo;
            if (vecinoFilters.estado === 'inactivos') return !v.activo;
            return true;
        });
    }

    setVecinos(result);
  }, [allVecinos, searchTerm, vecinoFilters]);

  // Filtered Events
  const filteredEventos = eventos.filter(evento => {
      if (!evento.activo) return false;
      if (eventFilters.subsecretaria && evento.subsecretaria_id.toString() !== eventFilters.subsecretaria) return false;
      if (eventFilters.tipo && evento.tipo_id?.toString() !== eventFilters.tipo) return false;
      return true;
  });

  const seleccionarVecino = async (vecino) => {
    setVecinoEncontrado(vecino);
    try {
      const response = await registrosAPI.getAll();
      // Filtrar eventos de este vecino
      const eventosDelVecino = response.data.filter(registro => registro.vecino_id === vecino.id);
      setEventosVecino(eventosDelVecino);
    } catch (error) {
      showAlert('Error al cargar historial', 'error');
    }
  };

  const volverAlListado = () => {
    setVecinoEncontrado(null);
    setEventosVecino([]);
    setEventoSeleccionado('');
    setNotas('');
  };

  const handleRegistro = async (e) => {
    e.preventDefault();

    if (!vecinoEncontrado) {
      showAlert('Debe seleccionar un vecino', 'error');
      return;
    }

    try {
      setLoading(true);
      await registrosAPI.registerByDocumento({
        documento: vecinoEncontrado.documento,
        evento_id: parseInt(eventoSeleccionado),
        notas: notas,
      });

      showAlert('Registro exitoso', 'success');
      setEventoSeleccionado('');
      setNotas('');

      // Recargar eventos del vecino
      const response = await registrosAPI.getAll();
      const eventosDelVecino = response.data.filter(registro => registro.vecino_id === vecinoEncontrado.id);
      setEventosVecino(eventosDelVecino);
    } catch (error) {
      showAlert(error.response?.data?.error || 'Error al registrar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  return (
    <div className="registro-evento">
      <div className="card">
        <div className="card-header">
          <h2>Registro de Vecinos a Eventos</h2>
          {vecinoEncontrado && (
            <button className="btn btn-secondary" onClick={volverAlListado}>
              <FaArrowLeft /> Volver al listado
            </button>
          )}
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        {!vecinoEncontrado ? (
          <>
            <div className="search-section filters-container">
              <div className="advanced-filters">
                  <div className="search-box filter-group" style={{ flex: 2 }}>
                    <div className="search-input-container">
                      <FaSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre, apellido, documento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          className="clear-search"
                          onClick={() => setSearchTerm('')}
                          title="Limpiar búsqueda"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="filter-group">
                    <select
                        value={vecinoFilters.estado}
                        onChange={(e) => setVecinoFilters({...vecinoFilters, estado: e.target.value})}
                        className="filter-select"
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="activos">Activos</option>
                        <option value="inactivos">Inactivos</option>
                    </select>
                  </div>
              </div>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Documento</th>
                    <th>Email</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingVecinos ? (
                    <tr>
                      <td colSpan="5" className="text-center">Cargando vecinos...</td>
                    </tr>
                  ) : vecinos.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">No se encontraron vecinos</td>
                    </tr>
                  ) : (
                    vecinos.map((vecino) => (
                      <tr key={vecino.id}>
                        <td>{vecino.nombre}</td>
                        <td>{vecino.apellido}</td>
                        <td>{vecino.documento}</td>
                        <td>{vecino.email || '-'}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => seleccionarVecino(vecino)}
                            title="Seleccionar para registrar"
                            disabled={isVisitor}
                          >
                            <FaUserCheck /> Seleccionar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="vecino-info fade-in">
            <div className="vecino-header-card">
              <div className="vecino-avatar-placeholder">
                <FaUsers />
              </div>
              <div className="vecino-header-details">
                <h3>{vecinoEncontrado.nombre} {vecinoEncontrado.apellido}</h3>
                <div className="vecino-badges">
                  <span className="info-badge">DNI: {vecinoEncontrado.documento}</span>
                  <span className={`badge ${vecinoEncontrado.activo ? 'badge-success' : 'badge-danger'}`}>
                    {vecinoEncontrado.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            <div className="registro-grid">
              {/* COLUMNA 1: FORMULARIO */}
              <div className="registro-form-column">
                {!isVisitor && (
                  <div className="card">
                    <h3>Registrar a Nuevo Evento</h3>
                    
                    {/* Event Filters */}
                    <div className="event-filters" style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '5px' }}>Filtrar Eventos:</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <select 
                                    className="form-select" 
                                    style={{ fontSize: '0.85rem' }}
                                    value={eventFilters.subsecretaria}
                                    onChange={(e) => setEventFilters({...eventFilters, subsecretaria: e.target.value})}
                                >
                                    <option value="">Todas las Subsecretarías</option>
                                    {subsecretarias.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                </select>
                                <select 
                                    className="form-select" 
                                    style={{ fontSize: '0.85rem' }}
                                    value={eventFilters.tipo}
                                    onChange={(e) => setEventFilters({...eventFilters, tipo: e.target.value})}
                                >
                                    <option value="">Todos los Tipos</option>
                                    {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleRegistro}>
                      <div className="form-group">
                        <label>Seleccionar Evento *</label>
                        <select
                          value={eventoSeleccionado}
                          onChange={(e) => setEventoSeleccionado(e.target.value)}
                          required
                          className="form-select"
                        >
                          <option value="">-- Seleccione un evento --</option>
                          {filteredEventos.map((evento) => (
                              <option key={evento.id} value={evento.id}>
                                {evento.nombre} - {new Date(evento.fecha_evento).toLocaleDateString('es-ES')}
                              </option>
                            ))}
                        </select>
                        {filteredEventos.length === 0 && (
                            <small className="text-muted">No hay eventos activos que coincidan con los filtros.</small>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Notas (opcional)</label>
                        <textarea
                          value={notas}
                          onChange={(e) => setNotas(e.target.value)}
                          placeholder="Notas adicionales sobre el registro..."
                          className="form-textarea"
                          rows="3"
                        />
                      </div>

                      <div className="form-actions">
                        <button
                          type="submit"
                          className="btn btn-success btn-block"
                          disabled={loading || !eventoSeleccionado}
                        >
                          <FaUserCheck /> {loading ? 'Registrando...' : 'Confirmar Registro'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* COLUMNA 2: HISTORIAL */}
              <div className="historial-column">
                <div className="card">
                  <h3>Historial de Eventos</h3>
                  <div className="eventos-lista">
                    {eventosVecino && eventosVecino.length > 0 ? (
                      eventosVecino.map((evento) => (
                        <div key={evento.id_registro} className="evento-item">
                          <div className="evento-header-row">
                            <div className="evento-titulo">{evento.nombre}</div>
                            <div className="evento-fecha-badge">
                              {new Date(evento.fecha_evento).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                          
                          <div className="evento-detalles-grid">
                            <div className="detalle-row">
                                <div className="detalle-item" title="Lugar">
                                    <FaMapMarkerAlt className="detalle-icon" /> 
                                    <span>{evento.lugar || 'Sin lugar'}</span>
                                </div>
                                <div className="detalle-item" title="Hora">
                                    <FaClock className="detalle-icon" /> 
                                    <span>{evento.hora_evento ? evento.hora_evento.substring(0, 5) : 'Sin hora'}</span>
                                </div>
                            </div>
                            
                            <div className="detalle-row">
                                <div className="detalle-item full-width" title="Subsecretaría">
                                    <FaBuilding className="detalle-icon" /> 
                                    <span>{evento.subsecretaria_nombre || 'Sin subsecretaría'}</span>
                                </div>
                            </div>

                            <div className="detalle-tags">
                                {evento.tipo_nombre && (
                                    <span className="evento-tag tipo">
                                        <FaTag /> {evento.tipo_nombre}
                                    </span>
                                )}
                                {evento.subtipo_nombre && (
                                    <span className="evento-tag subtipo">
                                        <FaTag /> {evento.subtipo_nombre}
                                    </span>
                                )}
                            </div>
                          </div>

                          <div className="evento-footer">
                            <small>Registrado el {new Date(evento.fecha_registro).toLocaleDateString('es-ES')} a las {new Date(evento.fecha_registro).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-events-message">
                        <p>Este vecino no ha participado en eventos recientes.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistroEvento;