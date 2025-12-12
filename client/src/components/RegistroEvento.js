import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserCheck, FaArrowLeft, FaUsers } from 'react-icons/fa';
import { registrosAPI, vecinosAPI, eventosAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';
import './RegistroEvento.css';

const RegistroEvento = () => {
  const { isVisitor } = useUser();
  const [vecinos, setVecinos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [vecinoEncontrado, setVecinoEncontrado] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [eventosVecino, setEventosVecino] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loadingVecinos, setLoadingVecinos] = useState(false);

  useEffect(() => {
    loadEventos();
    loadVecinos();
  }, []);

  const loadEventos = async () => {
    try {
      const response = await eventosAPI.getActive();
      setEventos(response.data);
    } catch (error) {
      showAlert('Error al cargar eventos', 'error');
    }
  };

  const loadVecinos = async () => {
    try {
      setLoadingVecinos(true);
      const response = await vecinosAPI.getAll();
      setVecinos(response.data);
    } catch (error) {
      showAlert('Error al cargar vecinos', 'error');
    } finally {
      setLoadingVecinos(false);
    }
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === '') {
      loadVecinos();
      return;
    }

    try {
      const response = await vecinosAPI.search(term);
      setVecinos(response.data);
    } catch (error) {
      showAlert('Error en la búsqueda', 'error');
    }
  };

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
            <div className="search-section">
              <div className="form-group">
                <label>Buscar Vecino</label>
                <div className="search-input-container">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, apellido, documento..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="search-input"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className="clear-search"
                      onClick={() => {
                        setSearchTerm('');
                        loadVecinos();
                      }}
                      title="Limpiar búsqueda"
                    >
                      ×
                    </button>
                  )}
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
                          {eventos
                            .filter(e => e.activo)
                            .map((evento) => (
                              <option key={evento.id} value={evento.id}>
                                {evento.nombre} - {new Date(evento.fecha_evento).toLocaleDateString('es-ES')}
                              </option>
                            ))}
                        </select>
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
                          <div className="evento-header">
                            <div className="evento-titulo">{evento.nombre}</div>
                            <div className="evento-fecha">
                              {new Date(evento.fecha_evento).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                          <div className="evento-detalles">
                            <span className="evento-lugar">📍 {evento.lugar || 'Sin lugar'}</span>
                            <span className="evento-hora">🕒 {evento.hora_evento || 'Sin hora'}</span>
                            <span className="evento-subsecretaria">🏢 {evento.subsecretaria_nombre || 'Sin subsecretaría'}</span>
                            <span className="evento-tipo">🏷️ {evento.tipo_nombre || 'Sin tipo'}</span>
                            {evento.subtipo_nombre && <span>🏷️ {evento.subtipo_nombre}</span>}
                          </div>
                          <div className="evento-fecha-registro">
                            Registrado: {new Date(evento.fecha_registro).toLocaleString('es-ES')}
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