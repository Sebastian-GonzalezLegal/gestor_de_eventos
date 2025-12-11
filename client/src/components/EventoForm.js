import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { subsecretariasAPI, tiposAPI, subtiposAPI } from '../services/api';
import './Modal.css';

const EventoForm = ({ evento, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_evento: '',
    hora_evento: '',
    lugar: '',
    subsecretaria_id: '',
    tipo_id: '',
    subtipo_id: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subsecretarias, setSubsecretarias] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [subtipos, setSubtipos] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    if (evento) {
      const fecha = evento.fecha_evento ? evento.fecha_evento.split('T')[0] : '';
      setFormData({
        nombre: evento.nombre || '',
        descripcion: evento.descripcion || '',
        fecha_evento: fecha,
        hora_evento: evento.hora_evento || '',
        lugar: evento.lugar || '',
        subsecretaria_id: evento.subsecretaria_id ? evento.subsecretaria_id.toString() : '',
        tipo_id: evento.tipo_id ? evento.tipo_id.toString() : '',
        subtipo_id: evento.subtipo_id ? evento.subtipo_id.toString() : '',
      });

      // Si hay un tipo seleccionado, cargar sus subtipos
      if (evento.tipo_id) {
        loadSubtiposByTipo(evento.tipo_id);
      }
    }
  }, [evento]);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      const [subsecretariasRes, tiposRes] = await Promise.all([
        subsecretariasAPI.getAll(),
        tiposAPI.getAll()
      ]);
      setSubsecretarias(subsecretariasRes.data);
      setTipos(tiposRes.data);
    } catch (error) {
      console.error('Error cargando opciones:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadSubtiposByTipo = async (tipoId) => {
    if (!tipoId) {
      setSubtipos([]);
      return;
    }

    try {
      const response = await subtiposAPI.getByTipo(tipoId);
      setSubtipos(response.data);
    } catch (error) {
      console.error('Error cargando subtipos:', error);
      setSubtipos([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(null);

    // Si cambia el tipo, resetear subtipo y cargar nuevos subtipos
    if (name === 'tipo_id') {
      setFormData(prev => ({
        ...prev,
        tipo_id: value,
        subtipo_id: '' // Resetear subtipo cuando cambia el tipo
      }));
      loadSubtiposByTipo(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Convertir strings vacías a null para los IDs
      const dataToSend = {
        ...formData,
        subsecretaria_id: formData.subsecretaria_id === '' ? null : parseInt(formData.subsecretaria_id),
        tipo_id: formData.tipo_id === '' ? null : parseInt(formData.tipo_id),
        subtipo_id: formData.subtipo_id === '' ? null : parseInt(formData.subtipo_id),
      };

      await onSave(dataToSend);
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
          <h3>{evento ? 'Editar Evento' : 'Nuevo Evento'}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
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

            <div className="form-group">
              <label>Subsecretaría</label>
              <select
                name="subsecretaria_id"
                value={formData.subsecretaria_id}
                onChange={handleChange}
                disabled={loadingOptions}
              >
                <option value="">Seleccione una subsecretaría</option>
                {subsecretarias.map((subsecretaria) => (
                  <option key={subsecretaria.id} value={subsecretaria.id}>
                    {subsecretaria.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tipo</label>
              <select
                name="tipo_id"
                value={formData.tipo_id}
                onChange={handleChange}
                disabled={loadingOptions}
              >
                <option value="">Seleccione un tipo</option>
                {tipos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subtipo</label>
              <select
                name="subtipo_id"
                value={formData.subtipo_id}
                onChange={handleChange}
                disabled={loadingOptions || !formData.tipo_id}
              >
                <option value="">
                  {formData.tipo_id ? 'Seleccione un subtipo' : 'Primero seleccione un tipo'}
                </option>
                {subtipos.map((subtipo) => (
                  <option key={subtipo.id} value={subtipo.id}>
                    {subtipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                <FaTimes /> Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <FaSave /> {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventoForm;