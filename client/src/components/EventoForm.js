import React, { useState, useEffect } from 'react';
import { eventosAPI } from '../services/api';
import './Modal.css';

const EventoForm = ({ evento, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_evento: '',
    hora_evento: '',
    lugar: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (evento) {
      const fecha = evento.fecha_evento ? evento.fecha_evento.split('T')[0] : '';
      setFormData({
        nombre: evento.nombre || '',
        descripcion: evento.descripcion || '',
        fecha_evento: fecha,
        hora_evento: evento.hora_evento || '',
        lugar: evento.lugar || '',
      });
    }
  }, [evento]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (evento) {
        await eventosAPI.update(evento.id, formData);
      } else {
        await eventosAPI.create(formData);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{evento ? 'Editar Evento' : 'Nuevo Evento'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Fecha del Evento *</label>
            <input
              type="date"
              name="fecha_evento"
              value={formData.fecha_evento}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Hora</label>
            <input
              type="time"
              name="hora_evento"
              value={formData.hora_evento}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Lugar</label>
            <input
              type="text"
              name="lugar"
              value={formData.lugar}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventoForm;

