import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaSearch } from 'react-icons/fa';
import { eventosAPI } from '../services/api';
import EventoForm from './EventoForm';
import './Eventos.css';

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    try {
      setLoading(true);
      const response = await eventosAPI.getAll();
      setEventos(response.data);
    } catch (error) {
      showAlert('Error al cargar eventos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === '') {
      loadEventos();
      return;
    }

    try {
      setLoading(true);
      // Para eventos, podemos filtrar localmente por nombre, descripción o lugar
      const allEventos = await eventosAPI.getAll();
      const filteredEventos = allEventos.data.filter(evento =>
        evento.nombre.toLowerCase().includes(term.toLowerCase()) ||
        evento.descripcion?.toLowerCase().includes(term.toLowerCase()) ||
        evento.lugar?.toLowerCase().includes(term.toLowerCase())
      );
      setEventos(filteredEventos);
    } catch (error) {
      showAlert('Error en la búsqueda', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleCreate = () => {
    setEditingEvento(null);
    setShowModal(true);
  };

  const handleEdit = (evento) => {
    setEditingEvento(evento);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este evento?')) return;

    try {
      await eventosAPI.delete(id);
      showAlert('Evento eliminado correctamente');
      loadEventos();
    } catch (error) {
      showAlert('Error al eliminar evento', 'error');
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingEvento) {
        await eventosAPI.update(editingEvento.id, formData);
      } else {
        await eventosAPI.create(formData);
      }
      setShowModal(false);
      setEditingEvento(null);
      loadEventos();
      showAlert('Evento guardado correctamente');
    } catch (error) {
      showAlert('Error al guardar evento', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  return (
    <div className="eventos">
      <div className="card">
        <div className="card-header">
          <h2>Gestión de Eventos</h2>
          <button className="btn btn-primary" onClick={handleCreate}>
            <FaPlus /> Nuevo Evento
          </button>
        </div>

      <div className="search-box">
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o lugar..."
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
                loadEventos();
              }}
              title="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <div className="eventos-grid">
        {loading ? (
          <div className="loading">Cargando eventos...</div>
        ) : eventos.length === 0 ? (
          <div className="no-data">No hay eventos registrados</div>
        ) : (
          eventos.map((evento) => (
            <div key={evento.id} className="evento-card">
              <div className="evento-header">
                <div className="evento-title-section">
                  <h3>{evento.nombre}</h3>
                  {(evento.subsecretaria_nombre || evento.tipo_nombre || evento.subtipo_nombre) && (
                    <div className="evento-category-badges">
                      {evento.subsecretaria_nombre && (
                        <span className="category-badge category-subsecretaria">
                          🏢 {evento.subsecretaria_nombre}
                        </span>
                      )}
                      {evento.tipo_nombre && (
                        <span className="category-badge category-tipo">
                          🏷️ {evento.tipo_nombre}
                        </span>
                      )}
                      {evento.subtipo_nombre && (
                        <span className="category-badge category-subtipo">
                          🏷️ {evento.subtipo_nombre}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="evento-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEdit(evento)}
                    title="Editar evento"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(evento.id)}
                    title="Eliminar evento"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="evento-content">
                {evento.descripcion && (
                  <div className="evento-description-section">
                    <p className="evento-description">{evento.descripcion}</p>
                  </div>
                )}

                <div className="evento-details-grid">
                  <div className="detail-primary">
                    <div className="detail-item detail-date">
                      <FaCalendarAlt />
                      <span className="detail-text">{formatDate(evento.fecha_evento)}</span>
                    </div>
                    {evento.hora_evento && (
                      <div className="detail-item detail-time">
                        <FaClock />
                        <span className="detail-text">{formatTime(evento.hora_evento)}</span>
                      </div>
                    )}
                  </div>

                  {evento.lugar && (
                    <div className="detail-secondary">
                      <div className="detail-item detail-location">
                        <FaMapMarkerAlt />
                        <span className="detail-text">{evento.lugar}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <EventoForm
          evento={editingEvento}
          onClose={() => {
            setShowModal(false);
            setEditingEvento(null);
          }}
          onSave={handleSave}
        />
      )}
      </div>
    </div>
  );
};


export default Eventos;

