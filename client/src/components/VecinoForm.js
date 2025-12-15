import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { vecinosAPI } from '../services/api';

const VecinoForm = ({ vecino, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    email: '',
    telefono: '',
    calle: '',
    altura: '',
    piso: '',
    departamento: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vecino) {
      setFormData({
        nombre: vecino.nombre || '',
        apellido: vecino.apellido || '',
        documento: vecino.documento || '',
        email: vecino.email || '',
        telefono: vecino.telefono || '',
        calle: vecino.calle || '',
        altura: vecino.altura || '',
        piso: vecino.piso || '',
        departamento: vecino.departamento || ''
      });
    }
  }, [vecino]);

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
      if (vecino) {
        await vecinosAPI.update(vecino.id, formData);
      } else {
        await vecinosAPI.create(formData);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar vecino');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{vecino ? 'Editar Vecino' : 'Nuevo Vecino'}</h3>
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
                placeholder="Ingrese nombre"
              />
            </div>

            <div className="form-group">
              <label>Apellido *</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                placeholder="Ingrese apellido"
              />
            </div>

            <div className="form-group">
              <label>Documento *</label>
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                required
                placeholder="DNI o Pasaporte"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Teléfono de contacto"
              />
            </div>

            <h4 style={{marginTop: '20px', marginBottom: '10px', fontSize: '1.1em', color: '#555'}}>Dirección</h4>
            
            <div style={{display: 'flex', gap: '10px'}}>
              <div className="form-group" style={{flex: 2}}>
                <label>Calle</label>
                <input
                  type="text"
                  name="calle"
                  value={formData.calle}
                  onChange={handleChange}
                  placeholder="Calle"
                />
              </div>

              <div className="form-group" style={{flex: 1}}>
                <label>Altura</label>
                <input
                  type="text"
                  name="altura"
                  value={formData.altura}
                  onChange={handleChange}
                  placeholder="Número"
                />
              </div>
            </div>

            <div style={{display: 'flex', gap: '10px'}}>
              <div className="form-group" style={{flex: 1}}>
                <label>Piso</label>
                <input
                  type="text"
                  name="piso"
                  value={formData.piso}
                  onChange={handleChange}
                  placeholder="-"
                />
              </div>

              <div className="form-group" style={{flex: 1}}>
                <label>Depto</label>
                <input
                  type="text"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  placeholder="-"
                />
              </div>
            </div>

            <div className="modal-actions">
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

export default VecinoForm;
