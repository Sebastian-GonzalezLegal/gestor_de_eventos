import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaClipboardList, 
  FaClock, 
  FaUserPlus, 
  FaCalendarPlus, 
  FaSearch, 
  FaArrowRight, 
  FaEye, 
  FaExternalLinkAlt, 
  FaTimes 
} from 'react-icons/fa';
import { dashboardAPI, eventosAPI, vecinosAPI, registrosAPI } from '../services/api';
import AttendeesModal from './AttendeesModal';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const DetailsModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVecinos: 0,
    totalEventos: 0,
    registrosHoy: 0,
    proximosEventos: []
  });
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [attendeesModal, setAttendeesModal] = useState({
    show: false,
    loading: false,
    attendees: [],
    eventName: ''
  });

  const [detailsModal, setDetailsModal] = useState({
    show: false,
    type: '', // 'vecinos', 'eventos', 'registros'
    data: [],
    loading: false
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.getStats();
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleCardClick = async (type) => {
    setDetailsModal({ show: true, type, data: [], loading: true });
    try {
      let data = [];
      if (type === 'vecinos') {
        const res = await vecinosAPI.getAll();
        data = res.data.slice(0, 10); 
      } else if (type === 'eventos') {
        const res = await eventosAPI.getActive();
        data = res.data;
      } else if (type === 'registros') {
        const res = await registrosAPI.getAll();
        const today = new Date().toISOString().split('T')[0];
        data = res.data.filter(r => r.fecha_registro && r.fecha_registro.startsWith(today));
      }
      setDetailsModal(prev => ({ ...prev, data, loading: false }));
    } catch (error) {
      console.error(`Error loading details for ${type}:`, error);
      setDetailsModal(prev => ({ ...prev, loading: false }));
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
      setAttendeesModal(prev => ({
        ...prev,
        loading: false
      }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return { day: '--', month: '---' };
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''),
      full: date.toLocaleDateString('es-ES')
    };
  };

  const today = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  if (loading) {
    return (
      <div className="dashboard-container" style={{display: 'flex', justifyContent: 'center', paddingTop: '100px'}}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Render content for Details Modal
  const renderDetailsContent = () => {
    if (detailsModal.loading) {
      return <div className="text-center p-4">Cargando detalles...</div>;
    }

    if (!detailsModal.data || detailsModal.data.length === 0) {
       return <div className="alert alert-info">No hay datos disponibles para mostrar.</div>;
    }

    if (detailsModal.type === 'vecinos') {
      return (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {detailsModal.data.map(v => (
                <tr key={v.id || v.id_vecino}>
                  <td>{v.nombre} {v.apellido}</td>
                  <td>{v.documento}</td>
                  <td>
                    <span className={`badge ${v.activo ? 'badge-success' : 'badge-danger'}`}>
                      {v.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-center mt-3">
            <small className="text-muted">Mostrando últimos registros</small>
          </div>
        </div>
      );
    }

    if (detailsModal.type === 'eventos') {
      return (
        <div className="table-responsive">
          <table className="table">
             <thead>
              <tr>
                <th>Evento</th>
                <th>Fecha</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              {detailsModal.data.map(e => (
                <tr key={e.id}>
                  <td>{e.nombre}</td>
                  <td>{new Date(e.fecha_evento).toLocaleDateString('es-ES')}</td>
                  <td>{e.hora_evento?.substring(0, 5)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (detailsModal.type === 'registros') {
       return (
        <div className="table-responsive">
          <table className="table">
             <thead>
              <tr>
                <th>Vecino</th>
                <th>Evento</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              {detailsModal.data.map(r => (
                <tr key={r.id_registro}>
                  <td>{r.vecino_nombre || r.vecino?.nombre} {r.vecino_apellido || r.vecino?.apellido}</td>
                  <td>{r.evento_nombre || r.evento?.nombre}</td>
                  <td>{new Date(r.fecha_registro).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div className="dashboard-container fade-in">
      
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1 className="hero-title">Panel de Control</h1>
          <p className="hero-subtitle">Sistema de Gestión Integral Tigre Municipio</p>
        </div>
        <div className="hero-date-badge">
          <FaCalendarAlt /> {today}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card vecinos clickable-card" onClick={() => handleCardClick('vecinos')}>
          <div className="stat-icon"><FaUsers /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalVecinos}</div>
            <div className="stat-label">Vecinos Registrados</div>
          </div>
          <div className="stat-action-icon"><FaEye /></div>
        </div>

        <div className="stat-card eventos clickable-card" onClick={() => handleCardClick('eventos')}>
          <div className="stat-icon"><FaCalendarAlt /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalEventos}</div>
            <div className="stat-label">Eventos Disponibles</div>
          </div>
          <div className="stat-action-icon"><FaEye /></div>
        </div>

        <div className="stat-card registros clickable-card" onClick={() => handleCardClick('registros')}>
          <div className="stat-icon"><FaClipboardList /></div>
           <div className="stat-info">
            <div className="stat-value">{stats.registrosHoy}</div>
            <div className="stat-label">Inscripciones Hoy</div>
          </div>
          <div className="stat-action-icon"><FaEye /></div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content">
        
        {/* Upcoming Events List */}
        <div className="events-section">
          <div className="section-header">
            <h2>Próximos Eventos</h2>
            <Link to="/eventos" className="btn btn-sm btn-secondary">
              Ver todos <FaArrowRight style={{marginLeft: 8}} />
            </Link>
          </div>

          {stats.proximosEventos.length > 0 ? (
            <div className="events-list">
              {stats.proximosEventos.map((evento) => {
                const dateObj = formatDate(evento.fecha_evento);
                return (
                  <div key={evento.id} className="event-item">
                    <div className="event-date-badge">
                      <div className="event-date-day">{dateObj.day}</div>
                      <div className="event-date-month">{dateObj.month}</div>
                    </div>
                    <div className="event-details">
                      <span className="event-name">{evento.nombre}</span>
                      <div className="event-meta">
                        <span className="meta-icon"><FaClock /> {evento.hora_evento?.substring(0, 5) || 'N/A'}</span>
                        <span className="meta-icon"><FaUsers /> {evento.inscritos} inscritos</span>
                      </div>
                    </div>
                    <div className="event-action">
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleViewAttendees(evento)}
                        title="Ver lista de inscriptos"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-events">
              <FaCalendarAlt style={{fontSize: 40, opacity: 0.3, marginBottom: 16}} />
              <p>No hay eventos próximos programados.</p>
              <Link to="/eventos" className="btn btn-primary btn-sm mt-3">Crear uno nuevo</Link>
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="quick-actions-panel">
          <div className="quick-actions-card">
            <h3 style={{marginBottom: 20}}>Acceso Rápido</h3>
            
            <Link to="/vecinos" className="quick-btn">
              <div className="quick-btn-icon"><FaUserPlus /></div>
              <div className="quick-btn-text">
                <h3>Nuevo Vecino</h3>
                <p>Alta de residente</p>
              </div>
            </Link>

            <Link to="/eventos" className="quick-btn">
              <div className="quick-btn-icon"><FaCalendarPlus /></div>
              <div className="quick-btn-text">
                <h3>Crear Evento</h3>
                <p>Nueva actividad</p>
              </div>
            </Link>

            <Link to="/registro" className="quick-btn">
              <div className="quick-btn-icon"><FaSearch /></div>
              <div className="quick-btn-text">
                <h3>Inscripciones</h3>
                <p>Gestionar registros</p>
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
          onClose={() => setAttendeesModal({ ...attendeesModal, show: false })}
        />
      )}

      {/* Generic Details Modal */}
      <DetailsModal 
        isOpen={detailsModal.show} 
        onClose={() => setDetailsModal({ ...detailsModal, show: false })}
        title={
          detailsModal.type === 'vecinos' ? 'Detalle de Vecinos' :
          detailsModal.type === 'eventos' ? 'Eventos Activos' :
          'Inscripciones de Hoy'
        }
      >
        {renderDetailsContent()}
      </DetailsModal>

    </div>
  );
};

export default Dashboard;
