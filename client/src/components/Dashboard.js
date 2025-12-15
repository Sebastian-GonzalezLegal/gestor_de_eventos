import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaClipboardList, 
  FaClock, 
  FaUserPlus,
  FaCalendarPlus,
  FaSearch,
  FaCalendarCheck,
  FaEye
} from 'react-icons/fa';
import { dashboardAPI, eventosAPI } from '../services/api';
import AttendeesModal from './AttendeesModal';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVecinos: 0,
    totalEventos: 0,
    registrosHoy: 0,
    proximosEventos: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendeesModal, setAttendeesModal] = useState({
    show: false,
    loading: false,
    attendees: [],
    eventName: ''
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.getStats();
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('No se pudieron cargar las estadísticas.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
      setAttendeesModal(prev => ({
        ...prev,
        loading: false
      }));
    }
  };

  const closeAttendeesModal = () => {
    setAttendeesModal({ ...attendeesModal, show: false });
  };

  if (loading) return (
    <div className="dashboard-loading">
      <div className="spinner"></div>
      <p>Cargando información del sistema...</p>
    </div>
  );
  
  if (error) return (
    <div className="alert alert-danger fade-in">
      <div className="alert-content">{error}</div>
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return { day: '--', month: '---' };
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''),
      full: date.toLocaleDateString('es-ES')
    };
  };

  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Panel de Control</h1>
          <p className="dashboard-subtitle">
            Bienvenido al Sistema de Gestión de Eventos del Municipio de Tigre
          </p>
        </div>
        <div className="current-date">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-icon-wrapper vecinos">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>Total Vecinos</h3>
            <div className="stat-value">{stats.totalVecinos}</div>
            <div className="stat-label">Registrados en el sistema</div>
          </div>
        </div>

        <div className="stat-card fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="stat-icon-wrapper eventos">
            <FaCalendarCheck />
          </div>
          <div className="stat-content">
            <h3>Eventos Activos</h3>
            <div className="stat-value">{stats.totalEventos}</div>
            <div className="stat-label">Disponibles para inscripción</div>
          </div>
        </div>

        <div className="stat-card fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="stat-icon-wrapper registros">
            <FaClipboardList />
          </div>
          <div className="stat-content">
            <h3>Registros Hoy</h3>
            <div className="stat-value">{stats.registrosHoy}</div>
            <div className="stat-label">Inscripciones realizadas hoy</div>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="upcoming-events-section fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="section-header">
            <h2><FaCalendarAlt /> Próximos Eventos</h2>
            <Link to="/eventos" className="view-all-link">Ver todos</Link>
          </div>
          
          {stats.proximosEventos.length > 0 ? (
            <div className="upcoming-events-list">
              {stats.proximosEventos.map((evento) => {
                const dateObj = formatDate(evento.fecha_evento);
                return (
                  <div key={evento.id} className="upcoming-event-item">
                    <div className="event-date-box">
                      <div className="event-day">{dateObj.day}</div>
                      <div className="event-month">{dateObj.month}</div>
                    </div>
                    <div className="event-info">
                      <span className="event-title">{evento.nombre}</span>
                      <div className="event-meta">
                        <span className="meta-item"><FaClock /> {evento.hora_evento?.substring(0, 5) || 'N/A'}</span>
                        <span className="meta-separator">•</span>
                        <span className="meta-item">{dateObj.full}</span>
                      </div>
                    </div>
                    <div className="event-actions-col">
                      <div className="event-stats-badge">
                        {evento.inscritos} inscriptos
                      </div>
                      <button 
                        className="btn-text-primary" 
                        onClick={() => handleViewAttendees(evento)}
                        title="Ver inscriptos"
                      >
                        <FaEye /> Ver lista
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon"><FaCalendarAlt /></div>
              <h3>Sin eventos próximos</h3>
              <p>No hay eventos programados próximamente.</p>
              <Link to="/eventos" className="btn btn-primary btn-sm mt-3">Crear Evento</Link>
            </div>
          )}
        </div>

        <div className="quick-actions-section fade-in" style={{ animationDelay: '0.5s' }}>
          <h2>Accesos Rápidos</h2>
          <div className="quick-actions-grid">
            <Link to="/vecinos" className="quick-action-btn">
              <div className="quick-action-icon">
                <FaUserPlus />
              </div>
              <div className="quick-action-info">
                <h3>Nuevo Vecino</h3>
                <p>Registrar un nuevo vecino</p>
              </div>
            </Link>

            <Link to="/eventos" className="quick-action-btn">
              <div className="quick-action-icon">
                <FaCalendarPlus />
              </div>
              <div className="quick-action-info">
                <h3>Nuevo Evento</h3>
                <p>Crear un nuevo evento</p>
              </div>
            </Link>

            <Link to="/registro" className="quick-action-btn">
              <div className="quick-action-icon">
                <FaSearch />
              </div>
              <div className="quick-action-info">
                <h3>Inscribir</h3>
                <p>Inscribir vecino a evento</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {attendeesModal.show && (
        <AttendeesModal
          eventName={attendeesModal.eventName}
          attendees={attendeesModal.attendees}
          loading={attendeesModal.loading}
          onClose={closeAttendeesModal}
        />
      )}
    </div>
  );
};

export default Dashboard;
