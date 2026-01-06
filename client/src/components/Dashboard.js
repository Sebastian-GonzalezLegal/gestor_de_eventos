import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaClipboardList, 
  FaUserPlus, 
  FaCalendarPlus, 
  FaSearch, 
  FaArrowRight, 
  FaEye, 
  FaTimes 
} from 'react-icons/fa';
import { dashboardAPI, eventosAPI, vecinosAPI, registrosAPI } from '../services/api';
import AttendeesModal from './AttendeesModal';
import CalendarView from './CalendarView';
import { Link } from 'react-router-dom';
import { formatDate, getTodayFriendly } from '../utils/dateUtils';
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
  const [calendarEvents, setCalendarEvents] = useState([]);
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
    const fetchData = async () => {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          dashboardAPI.getStats(),
          eventosAPI.getAll()
        ]);
        setStats(statsRes.data);
        setCalendarEvents(eventsRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const today = getTodayFriendly();

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
      return (
        <div className="text-center p-4">
          <div className="spinner" style={{margin: '0 auto 10px'}}></div>
          <p>Cargando detalles...</p>
        </div>
      );
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
                  <td>{formatDate(e.fecha_evento)}</td>
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
              {detailsModal.data.map(r => {
                // Handle different data structures for neighbor name
                const nombre = r.vecino_nombre || r.vecino?.nombre || r.nombre || 'Sin nombre';
                const apellido = r.vecino_apellido || r.vecino?.apellido || r.apellido || '';
                const evento = r.evento_nombre || r.evento?.nombre || r.evento_titulo || 'Evento';
                
                return (
                  <tr key={r.id_registro || r.id}>
                    <td>{nombre} {apellido}</td>
                    <td>{evento}</td>
                    <td>{new Date(r.fecha_registro || r.created_at).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</td>
                  </tr>
                );
              })}
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
        
        {/* Calendar View */}
        <div className="events-section">
          <div className="section-header">
            <h2>Calendario de Eventos</h2>
            <Link to="/eventos" className="btn btn-sm btn-secondary">
              Gestionar Eventos <FaArrowRight style={{marginLeft: 8}} />
            </Link>
          </div>

          <CalendarView 
            events={calendarEvents} 
            onEventClick={(evento) => {
               // Open attendee modal or details
               // Since the user asked to see events of that day, and FullCalendar handles day clicks differently,
               // clicking an event usually shows its details.
               // We will use the handleViewAttendees which seems appropriate for "details".
               handleViewAttendees(evento);
            }} 
          />
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
