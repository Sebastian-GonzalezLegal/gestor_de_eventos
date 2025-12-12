import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaList } from 'react-icons/fa';
import { tiposAPI } from '../services/api';
import './Tipos.css';

const Tipos = ({ setActiveTab }) => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTipo, setEditingTipo] = useState(null);
  const [formData, setFormData] = useState({ nombre: '' });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadTipos();
  }, []);

  const loadTipos = async () => {
    try {
      setLoading(true);
      const response = await tiposAPI.getAll();
      setTipos(response.data);
    } catch (error) {
      showAlert('Error al cargar tipos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      showAlert('El nombre es requerido', 'error');
      return;
    }

    try {
      if (editingTipo) {
        await tiposAPI.update(editingTipo.id, formData);
        showAlert('Tipo actualizado correctamente', 'success');
      } else {
        await tiposAPI.create(formData);
        showAlert('Tipo creado correctamente', 'success');
      }

      setShowModal(false);
      setEditingTipo(null);
      setFormData({ nombre: '' });
      loadTipos();
    } catch (error) {
      showAlert(
        error.response?.data?.error || 'Error al guardar el tipo',
        'error'
      );
    }
  };

  const handleEdit = (tipo) => {
    setEditingTipo(tipo);
    setFormData({ nombre: tipo.nombre });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este tipo? Esto también eliminará todos sus subtipos.')) {
      return;
    }

    try {
      await tiposAPI.delete(id);
      showAlert('Tipo eliminado correctamente', 'success');
      loadTipos();
    } catch (error) {
      showAlert('Error al eliminar el tipo', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingTipo(null);
    setFormData({ nombre: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTipo(null);
    setFormData({ nombre: '' });
  };

  if (loading) {
    return <div className="loading">Cargando tipos...</div>;
  }

  return (
    <div className="tipos">
      <div className="card">
        <div className="card-header">
          <h2>Tipos</h2>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <FaPlus /> Nuevo Tipo
          </button>
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div className="tipos-grid">
          {tipos.length === 0 ? (
            <div className="no-data">No hay tipos registrados</div>
          ) : (
            tipos.map((tipo, index) => (
              <div key={tipo.id} className="tipo-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="tipo-header">
                  <h3>{tipo.nombre}</h3>
                  <div className="tipo-actions">
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => {
                        // Guardar el tipo seleccionado para filtrar en Subtipos
                        localStorage.setItem('filtroTipoInicial', tipo.id.toString());
                        setActiveTab('subtipos');
                      }}
                      title="Ver Subtipos"
                    >
                      <FaList /> Subtipos
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(tipo)}
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(tipo.id)}
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="tipo-content">
                  <div className="tipo-details">
                    <div className="detail-item">
                      <span role="img" aria-label="ID">🆔</span>
                      <span>ID: {tipo.id}</span>
                    </div>
                    <div className="detail-item">
                      <span role="img" aria-label="Fecha">📅</span>
                      <span>Creado: {new Date(tipo.fecha_creacion).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {editingTipo ? 'Editar Tipo' : 'Nuevo Tipo'}
              </h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  placeholder="Ingrese el nombre del tipo"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTipo ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tipos;