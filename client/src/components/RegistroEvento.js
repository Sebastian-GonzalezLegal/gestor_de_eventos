import React, { useState, useEffect } from 'react';
import { registrosAPI, usuariosAPI, eventosAPI } from '../services/api';
import './RegistroEvento.css';

const RegistroEvento = () => {
  const [documento, setDocumento] = useState('');
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [eventosUsuario, setEventosUsuario] = useState([]);
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

  const buscarUsuario = async () => {
    if (!documento.trim()) {
      showAlert('Por favor ingrese un documento', 'error');
      return;
    }

    setBuscando(true);
    setUsuarioEncontrado(null);
    setEventosUsuario([]);

    try {
      const usuario = await usuariosAPI.findByDocumento(documento);
      if (usuario) {
        setUsuarioEncontrado(usuario);
        // Cargar eventos del usuario
        const response = await usuariosAPI.getEventos(usuario.id);
        setEventosUsuario(response.data);
        showAlert('Usuario encontrado', 'success');
      } else {
        showAlert('Usuario no encontrado. Debe registrarlo primero en la sección Usuarios.', 'error');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        showAlert('Usuario no encontrado. Debe registrarlo primero en la sección Usuarios.', 'error');
      } else {
        showAlert('Error al buscar usuario', 'error');
      }
    } finally {
      setBuscando(false);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();

    if (!usuarioEncontrado) {
      showAlert('Debe buscar un usuario primero', 'error');
      return;
    }

    if (!eventoSeleccionado) {
      showAlert('Debe seleccionar un evento', 'error');
      return;
    }

    setLoading(true);

    try {
      await registrosAPI.registerByDocumento({
        documento: usuarioEncontrado.documento,
        evento_id: parseInt(eventoSeleccionado),
        notas: notas,
      });

      showAlert('Usuario registrado al evento correctamente', 'success');
      
      // Recargar eventos del usuario
      const response = await usuariosAPI.getEventos(usuarioEncontrado.id);
      setEventosUsuario(response.data);
      
      // Limpiar formulario
      setEventoSeleccionado('');
      setNotas('');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.error.includes('ya está registrado')) {
        showAlert('El usuario ya está registrado en este evento', 'error');
      } else {
        showAlert(error.response?.data?.error || 'Error al registrar usuario', 'error');
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
      buscarUsuario();
    }
  };

  return (
    <div className="registro-evento">
      <div className="card">
        <div className="card-header">
          <h2>Registro de Usuarios a Eventos</h2>
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div className="search-section">
          <div className="form-group">
            <label>Buscar Usuario por Documento</label>
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Ingrese el número de documento..."
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={buscando}
              />
              <button
                className="btn btn-primary"
                onClick={buscarUsuario}
                disabled={buscando || !documento.trim()}
              >
                {buscando ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>
        </div>

        {usuarioEncontrado && (
          <div className="usuario-info">
            <div className="card">
              <h3>Información del Usuario</h3>
              <div className="info-grid">
                <div>
                  <strong>Nombre:</strong> {usuarioEncontrado.nombre} {usuarioEncontrado.apellido}
                </div>
                <div>
                  <strong>Documento:</strong> {usuarioEncontrado.documento}
                </div>
                <div>
                  <strong>Email:</strong> {usuarioEncontrado.email || '-'}
                </div>
                <div>
                  <strong>Teléfono:</strong> {usuarioEncontrado.telefono || '-'}
                </div>
                <div>
                  <strong>Estado:</strong>{' '}
                  <span className={`badge ${usuarioEncontrado.activo ? 'badge-success' : 'badge-danger'}`}>
                    {usuarioEncontrado.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            {eventosUsuario.length > 0 && (
              <div className="card">
                <h3>Eventos Anteriores</h3>
                <div className="eventos-list">
                  {eventosUsuario.map((evento) => (
                    <div key={evento.id} className="evento-item">
                      <div className="evento-nombre">{evento.nombre}</div>
                      <div className="evento-fecha">
                        {new Date(evento.fecha_evento).toLocaleDateString('es-ES')}
                        {evento.hora_evento && ` - ${evento.hora_evento}`}
                      </div>
                      {evento.lugar && <div className="evento-lugar">{evento.lugar}</div>}
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
                    {loading ? 'Registrando...' : 'Registrar al Evento'}
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

