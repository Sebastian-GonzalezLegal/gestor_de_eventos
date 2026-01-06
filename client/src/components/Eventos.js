import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaSearch, FaTimes, FaBuilding, FaTag, FaEye } from 'react-icons/fa';
import { eventosAPI, subsecretariasAPI, tiposAPI, subtiposAPI } from '../services/api';
import EventoForm from './EventoForm';
import AttendeesModal from './AttendeesModal';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import './Eventos.css';

const Eventos = () => {
  const { isAdmin, isSubsecretaria, user } = useUser();
  const { showNotification } = useNotification();
  const canManage = isAdmin || isSubsecretaria;
  
  // Data states
  const [allEventos, setAllEventos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    subsecretaria: '',
    tipo: '',
    subtipo: '',
    estado: 'todos', // todos, activos, inactivos, expirados
    fechaDesde: '',
    fechaHasta: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Options for filters
  const [filterOptions, setFilterOptions] = useState({
    subsecretarias: [],
    tipos: [],
    subtipos: []
  });
  
  // UI states
  const [showModal, setShowModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [attendeesModal, setAttendeesModal] = useState({
    show: false,
    loading: false,
    attendees: [],
    eventName: ''
  });

  // Helpers
  const isExpired = useCallback((evento) => {
    if (!evento.fecha_evento) return false;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [year, month, day] = evento.fecha_evento.toString().split('T')[0].split('-');
    const eventDateLocal = new Date(year, month - 1, day);
    
    if (eventDateLocal < today) return true;
    
    if (eventDateLocal.getTime() === today.getTime() && evento.hora_evento) {
        const [hours, minutes] = evento.hora_evento.split(':');
        const eventTime = new Date(today);
        eventTime.setHours(hours, minutes, 0);
        return now > eventTime;
    }
    
    return false;
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [eventosRes, subsecretariasRes, tiposRes] = await Promise.all([
        eventosAPI.getAll(),
        subsecretariasAPI.getAll(),
        tiposAPI.getAll()
      ]);
      
      setAllEventos(eventosRes.data);
      setEventos(eventosRes.data);
      
      // Filter subsecretarias based on user role
      let subParams = subsecretariasRes.data;
      if (isSubsecretaria && user.subsecretaria_id) {
        subParams = subsecretariasRes.data.filter(s => s.id === user.subsecretaria_id);
        setFilters(prev => ({ ...prev, subsecretaria: user.subsecretaria_id.toString() }));
      }
      
      setFilterOptions(prev => ({
        ...prev,
        subsecretarias: subParams,
        tipos: tiposRes.data
      }));
    } catch (error) {
      console.error(error);
      showNotification('Error al cargar datos iniciales', 'error');
    } finally {
      setLoading(false);
    }
  }, [isSubsecretaria, user.subsecretaria_id]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load subtipos when tipo changes
  useEffect(() => {
    const loadSubtipos = async () => {
      if (!filters.tipo) {
        setFilterOptions(prev => ({ ...prev, subtipos: [] }));
        return;
      }
      try {
        const response = await subtiposAPI.getByTipo(filters.tipo);
        setFilterOptions(prev => ({ ...prev, subtipos: response.data }));
      } catch (error) {
        console.error('Error loading subtipos', error);
      }
    };
    loadSubtipos();
  }, [filters.tipo]);

  // Apply filters
  useEffect(() => {
    let result = allEventos;

    // Search term
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(evento =>
        evento.nombre.toLowerCase().includes(lowerTerm) ||
        evento.descripcion?.toLowerCase().includes(lowerTerm) ||
        evento.lugar?.toLowerCase().includes(lowerTerm)
      );
    }

    // Subsecretaria
    if (filters.subsecretaria) {
      result = result.filter(e => e.subsecretaria_id?.toString() === filters.subsecretaria);
    }

    // Tipo
    if (filters.tipo) {
      result = result.filter(e => e.tipo_id?.toString() === filters.tipo);
    }

    // Subtipo
    if (filters.subtipo) {
      result = result.filter(e => e.subtipo_id?.toString() === filters.subtipo);
    }

    // Estado
    if (filters.estado !== 'todos') {
      const now = new Date();
      result = result.filter(e => {
        const expired = isExpired(e);
        if (filters.estado === 'activos') return e.activo && !expired;
        if (filters.estado === 'inactivos') return !e.activo;
        if (filters.estado === 'expirados') return expired;
        return true;
      });
    }

    // Fechas
    if (filters.fechaDesde) {
      const desde = new Date(filters.fechaDesde);
      result = result.filter(e => new Date(e.fecha_evento) >= desde);
    }

    if (filters.fechaHasta) {
      const hasta = new Date(filters.fechaHasta);
      // Adjust 'hasta' to include the full day
      hasta.setHours(23, 59, 59, 999);
      result = result.filter(e => new Date(e.fecha_evento) <= hasta);
    }

    setEventos(result);
  }, [allEventos, filters, searchTerm, isExpired]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      if (name === 'tipo') {
        newFilters.subtipo = ''; // Reset subtipo when tipo changes
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      subsecretaria: isSubsecretaria && user.subsecretaria_id ? user.subsecretaria_id.toString() : '',
      tipo: '',
      subtipo: '',
      estado: 'todos',
      fechaDesde: '',
      fechaHasta: ''
    });
    setSearchTerm('');
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
      showNotification('Evento eliminado correctamente', 'success');
      loadInitialData();
    } catch (error) {
      showNotification('Error al eliminar evento', 'error');
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
      loadInitialData();
      showNotification('Evento guardado correctamente', 'success');
    } catch (error) {
      showNotification('Error al guardar evento', 'error');
    }
  };

  const handleViewAttendees = async (evento) => {
    setAttendeesModal({
      show: true,
      loading: true,
      attendees: [],
      eventName: evento.nombre
    });

    try {
      const response = await eventosAPI.getVecinos(evento.id);
      setAttendeesModal(prev => ({
        ...prev,
        loading: false,
        attendees: response.data
      }));
    } catch (error) {
      console.error('Error al cargar asistentes:', error);
      showNotification('Error al cargar la lista de asistentes', 'error');
      setAttendeesModal(prev => ({
        ...prev,
        loading: false
      }));
    }
  };

  const closeAttendeesModal = () => {
    setAttendeesModal({ ...attendeesModal, show: false });
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
          {canManage && (
            <button className="btn btn-primary" onClick={handleCreate}>
              <FaPlus /> Nuevo Evento
            </button>
          )}
        </div>

      <div className="filters-container">
        <div className="search-box">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, descripción o lugar..."
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

        <div className="advanced-filters">
          <div className="filter-group">
            <select
              name="estado"
              value={filters.estado}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
              <option value="expirados">Expirados</option>
            </select>
          </div>

          {!isSubsecretaria && (
            <div className="filter-group">
              <select
                name="subsecretaria"
                value={filters.subsecretaria}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Todas las subsecretarías</option>
                {filterOptions.subsecretarias.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-group">
            <select
              name="tipo"
              value={filters.tipo}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Todos los tipos</option>
              {filterOptions.tipos.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              name="subtipo"
              value={filters.subtipo}
              onChange={handleFilterChange}
              disabled={!filters.tipo}
              className="filter-select"
            >
              <option value="">Todos los subtipos</option>
              {filterOptions.subtipos.map(subtipo => (
                <option key={subtipo.id} value={subtipo.id}>{subtipo.nombre}</option>
              ))}
            </select>
          </div>

          <div className="filter-group date-filter">
             <input
               type="date"
               name="fechaDesde"
               value={filters.fechaDesde}
               onChange={handleFilterChange}
               className="filter-input"
               placeholder="Desde"
             />
          </div>
          <div className="filter-group date-filter">
             <input
               type="date"
               name="fechaHasta"
               value={filters.fechaHasta}
               onChange={handleFilterChange}
               className="filter-input"
               placeholder="Hasta"
             />
          </div>

          <button className="btn-clear-filters" onClick={clearFilters} title="Limpiar filtros">
            Limpiar
          </button>
        </div>
      </div>

      <div className="eventos-grid">
        {loading ? (
          <div className="loading">Cargando eventos...</div>
        ) : eventos.length === 0 ? (
          <div className="no-data">No hay eventos que coincidan con los filtros</div>
        ) : (
          eventos.map((evento) => {
            const expired = isExpired(evento);
            return (
            <div key={evento.id} className={`evento-card ${expired ? 'expired' : ''} ${!evento.activo ? 'inactive' : ''}`}>
              <div className="evento-header">
                <div className="evento-title-section">
                  <h3>
                    {evento.nombre}
                    {expired && <span className="status-badge status-expired">Expirado</span>}
                    {!evento.activo && !expired && <span className="status-badge status-inactive">Inactivo</span>}
                  </h3>
                  {(evento.subsecretaria_nombre || evento.tipo_nombre || evento.subtipo_nombre) && (
                    <div className="evento-category-badges">
                      {evento.subsecretaria_nombre && (
                        <span className="category-badge category-subsecretaria">
                          <FaBuilding /> {evento.subsecretaria_nombre}
                        </span>
                      )}
                      {evento.tipo_nombre && (
                        <span className="category-badge category-tipo">
                          <FaTag /> {evento.tipo_nombre}
                        </span>
                      )}
                      {evento.subtipo_nombre && (
                        <span className="category-badge category-subtipo">
                          <FaTag /> {evento.subtipo_nombre}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {canManage && (
                  <div className="evento-actions">
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => handleViewAttendees(evento)}
                      title="Ver inscriptos"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(evento)}
                      title={expired ? "No se puede editar evento expirado" : "Editar evento"}
                      disabled={expired}
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
                )}
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
            );
          })
        )}
      </div>

      {showModal && canManage && (
        <EventoForm
          evento={editingEvento}
          onClose={() => {
            setShowModal(false);
            setEditingEvento(null);
          }}
          onSave={handleSave}
        />
      )}

      {attendeesModal.show && (
        <AttendeesModal
          eventName={attendeesModal.eventName}
          attendees={attendeesModal.attendees}
          loading={attendeesModal.loading}
          onClose={closeAttendeesModal}
        />
      )}
      </div>
    </div>
  );
};

export default Eventos;
