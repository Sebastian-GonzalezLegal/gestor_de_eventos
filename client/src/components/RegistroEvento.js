import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserCheck, FaCalendarPlus } from 'react-icons/fa';
import { registrosAPI, vecinosAPI, eventosAPI } from '../services/api';
import './RegistroEvento.css';

const RegistroEvento = () => {
  const [documento, setDocumento] = useState('');
  const [vecinoEncontrado, setVecinoEncontrado] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [eventosVecino, setEventosVecino] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    try {
      const response = await eventosAPI.getActive();
      setEventos(response.data);
    } catch (error) {
      showAlert('Error al cargar eventos', 'error');
    }
  };

  const buscarVecino = async () => {
    if (!documento.trim()) {
      showAlert('Por favor ingrese un documento', 'error');
      return;
    }

    setBuscando(true);
    setVecinoEncontrado(null);
    setEventosVecino([]);

    try {
      const vecino = await vecinosAPI.findByDocumento(documento);
      if (vecino) {
        setVecinoEncontrado(vecino);
        // Cargar eventos del vecino
        const response = await vecinosAPI.getEventos(vecino.id);
        setEventosVecino(response.data);
        showAlert('Vecino encontrado', 'success');
      } else {
        showAlert('Vecino no encontrado. Debe registrarlo primero en la sección Vecinos.', 'error');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        showAlert('Vecino no encontrado. Debe registrarlo primero en la sección Vecinos.', 'error');
      } else {
        showAlert('Error al buscar Vecino', 'error');
      }
    } finally {
      setBuscando(false);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();

    if (!vecinoEncontrado) {
      showAlert('Debe buscar un vecino primero', 'error');
      return;
    }

    if (!eventoSeleccionado) {
      showAlert('Debe seleccionar un evento', 'error');
      return;
    }

    setLoading(true);

    try {
      await registrosAPI.registerByDocumento({
        documento: vecinoEncontrado.documento,
        evento_id: parseInt(eventoSeleccionado),
        notas: notas,
      });

      showAlert('Vecino registrado al evento correctamente', 'success');

      // Recargar eventos del vecino
      const response = await vecinosAPI.getEventos(vecinoEncontrado.id);
      setEventosVecino(response.data);
      
      // Limpiar formulario
      setEventoSeleccionado('');
      setNotas('');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.error.includes('ya está registrado')) {
        showAlert('El Vecino ya está registrado en este evento', 'error');
      } else {
        showAlert(error.response?.data?.error || 'Error al registrar Vecino', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      buscarVecino();
    }
  };

  return (
    <div className="registro-evento">
      <div className="card">
        <div className="card-header">
          <h2>Registro de Vecinos a Eventos</h2>
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div className="search-section">
          <div className="form-group">
            <label>Buscar Vecino por Documento</label>
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Ingrese el número de documento..."
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={buscando}
                className="search-input"
              />
              {documento && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => {
                    setDocumento('');
                    setVecinoEncontrado(null);
                    setEventosVecino([]);
                  }}
                  title="Limpiar búsqueda"
                >
                  ×
                </button>
              )}
              <button
                className="btn btn-primary search-button"
                onClick={buscarVecino}
                disabled={buscando || !documento.trim()}
              >
                {buscando ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>
        </div>

        {vecinoEncontrado && (
          <div className="vecino-info">
            <div className="card">
              <h3>Información del Vecino</h3>
              <div className="info-grid">
                <div>
                  <strong>Nombre:</strong> {vecinoEncontrado.nombre} {vecinoEncontrado.apellido}
                </div>
                <div>
                  <strong>Documento:</strong> {vecinoEncontrado.documento}
                </div>
                <div>
                  <strong>Email:</strong> {vecinoEncontrado.email || '-'}
                </div>
                <div>
                  <strong>Teléfono:</strong> {vecinoEncontrado.telefono || '-'}
                </div>
                <div>
                  <strong>Estado:</strong>{' '}
                  <span className={`badge ${vecinoEncontrado.activo ? 'badge-success' : 'badge-danger'}`}>
                    {vecinoEncontrado.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            {eventosVecino.length > 0 && (
              <div className="card">
                <h3>Eventos Anteriores</h3>
                <div className="eventos-list">
                  {eventosVecino.map((evento) => (
                    <div key={evento.id} className="evento-item">
                      <div className="evento-nombre">{evento.nombre}</div>
                      <div className="evento-fecha">
                        {new Date(evento.fecha_evento).toLocaleDateString('es-ES')}
                        {evento.hora_evento && ` - ${evento.hora_evento}`}
                      </div>
                      {evento.lugar && <div className="evento-lugar">{evento.lugar}</div>}
                      {(evento.subsecretaria_nombre || evento.tipo_nombre || evento.subtipo_nombre) && (
                        <div className="evento-categoria">
                          {evento.subsecretaria_nombre && <span>🏢 {evento.subsecretaria_nombre}</span>}
                          {evento.tipo_nombre && <span>🏷️ {evento.tipo_nombre}</span>}
                          {evento.subtipo_nombre && <span>🏷️ {evento.subtipo_nombre}</span>}
                        </div>
                      )}
                      <div className="evento-fecha-registro">
                        Registrado: {new Date(evento.fecha_registro).toLocaleString('es-ES')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              <h3>Registrar a Nuevo Evento</h3>
              <form onSubmit={handleRegistro}>
                <div className="form-group">
                  <label>Seleccionar Evento *</label>
                  <select
                    value={eventoSeleccionado}
                    onChange={(e) => setEventoSeleccionado(e.target.value)}
                    required
                  >
                    <option value="">-- Seleccione un evento --</option>
                    {eventos
                      .filter(e => e.activo)
                      .map((evento) => (
                        <option key={evento.id} value={evento.id}>
                          {evento.nombre} - {new Date(evento.fecha_evento).toLocaleDateString('es-ES')}
                          {evento.subsecretaria_nombre && ` (${evento.subsecretaria_nombre}`}
                          {evento.tipo_nombre && ` - ${evento.tipo_nombre}`}
                          {evento.subtipo_nombre && ` - ${evento.subtipo_nombre}`}
                          {(evento.subsecretaria_nombre || evento.tipo_nombre || evento.subtipo_nombre) && ')'}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Notas (opcional)</label>
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows="3"
                    placeholder="Notas adicionales sobre el registro..."
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading || !eventoSeleccionado}
                  >
                    <FaUserCheck /> {loading ? 'Registrando...' : 'Registrar al Evento'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistroEvento;

