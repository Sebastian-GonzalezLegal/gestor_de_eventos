import React, { useState, useEffect } from 'react';
import { eventosAPI } from '../services/api';
import EventoForm from './EventoForm';
import './Eventos.css';

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [alert, setAlert] = useState(null);

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

  const handleCreate = () => {
    setEditingEvento(null);
    setShowModal(true);
  };

  const handleEdit = (evento) => {
    setEditingEvento(evento);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este evento?')) {
      try {
        await eventosAPI.delete(id);
        showAlert('Evento eliminado correctamente', 'success');
        loadEventos();
      } catch (error) {
        showAlert(error.response?.data?.error || 'Error al eliminar evento', 'error');
      }
    }
  };

  const handleToggleActivo = async (id) => {
    try {
      await eventosAPI.toggleActivo(id);
      showAlert('Estado actualizado correctamente', 'success');
      loadEventos();
    } catch (error) {
      showAlert('Error al actualizar estado', 'error');
    }
  };

  const handleSave = () => {
    setShowModal(false);
    loadEventos();
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="eventos">
      <div className="card">
        <div className="card-header">
          <h2>Gestión de Eventos</h2>
          <button className="btn btn-primary" onClick={handleCreate}>
            + Nuevo Evento
          </button>
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Lugar</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {eventos.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    No hay eventos registrados
                  </td>
                </tr>
              ) : (
                eventos.map((evento) => (
                  <tr key={evento.id}>
                    <td>{evento.nombre}</td>
                    <td>{evento.descripcion || '-'}</td>
                    <td>{new Date(evento.fecha_evento).toLocaleDateString('es-ES')}</td>
                    <td>{evento.hora_evento || '-'}</td>
                    <td>{evento.lugar || '-'}</td>
                    <td>
                      <span className={`badge ${evento.activo ? 'badge-success' : 'badge-danger'}`}>
                        {evento.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleEdit(evento)}
                        >
                          Editar
                        </button>
                        <button
                          className={`btn ${evento.activo ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleToggleActivo(evento.id)}
                        >
                          {evento.activo ? 'Inhabilitar' : 'Habilitar'}
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(evento.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <EventoForm
          evento={editingEvento}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Eventos;

