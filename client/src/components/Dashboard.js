import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaClipboardList, 
  FaClock, 
  FaUserPlus,
  FaCalendarPlus,
  FaSearch
} from 'react-icons/fa';
import { dashboardAPI } from '../services/api';
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

  if (loading) return <div className="loading">Cargando estadísticas...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const formatDate = (dateString) => {
    if (!dateString) return { day: '--', month: '---' };
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('es-ES', { month: 'short' }),
      full: date.toLocaleDateString('es-ES')
    };
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Panel de Control</h1>
        <p>Bienvenido al Sistema de Gestión de Eventos del Municipio de Tigre</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon vecinos">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>Total Vecinos</h3>
            <div className="stat-value">{stats.totalVecinos}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon eventos">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <h3>Eventos Activos</h3>
            <div className="stat-value">{stats.totalEventos}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon registros">
            <FaClipboardList />
          </div>
          <div className="stat-content">
            <h3>Registros Hoy</h3>
            <div className="stat-value">{stats.registrosHoy}</div>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="upcoming-events-section">
          <h2><FaCalendarAlt /> Próximos Eventos</h2>
          
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
                        <span><FaClock /> {evento.hora_evento?.substring(0, 5) || 'N/A'}</span>
                        <span>|</span>
                        <span>{dateObj.full}</span>
                      </div>
                    </div>
                    <div className="event-stats">
                      {evento.inscritos} inscriptos
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-data">No hay eventos próximos programados.</div>
          )}
        </div>

        <div className="quick-actions-section">
          <h2>Accesos Rápidos</h2>
          <div className="quick-actions-grid">
            <Link to="/vecinos" className="quick-action-btn">
              <div className="quick-action-icon">
                <FaUserPlus />
              </div>
              <div className="quick-action-info">
                <h3>Nuevo Vecino</h3>
                <p>Registrar un nuevo vecino en el sistema</p>
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
                <h3>Registrar a Evento</h3>
                <p>Inscribir vecino a un evento</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
