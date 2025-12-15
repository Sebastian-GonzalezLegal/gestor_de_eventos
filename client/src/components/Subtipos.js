import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { subtiposAPI, tiposAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';
import './Vecinos.css';

const Subtipos = () => {
  const { isAdmin, isSubsecretaria } = useUser();
  const canManage = isAdmin || isSubsecretaria;
  const [subtipos, setSubtipos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubtipo, setEditingSubtipo] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', tipo_id: '' });
  const [selectedTipo, setSelectedTipo] = useState('');
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadData();

    // Verificar si hay un filtro inicial guardado
    const filtroInicial = localStorage.getItem('filtroTipoInicial');
    if (filtroInicial) {
      setSelectedTipo(filtroInicial);
      localStorage.removeItem('filtroTipoInicial'); // Limpiar después de usar
    }
  }, []);

  useEffect(() => {
    if (selectedTipo) {
      loadSubtiposByTipo(selectedTipo);
    } else {
      loadAllSubtipos();
    }
  }, [selectedTipo]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAllSubtipos(),
        loadTipos()
      ]);
    } catch (error) {
      showAlert('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAllSubtipos = async () => {
    try {
      const response = await subtiposAPI.getAll();
      setSubtipos(response.data);
    } catch (error) {
      showAlert('Error al cargar subtipos', 'error');
    }
  };

  const loadSubtiposByTipo = async (tipoId) => {
    try {
      const response = await subtiposAPI.getByTipo(tipoId);
      setSubtipos(response.data);
    } catch (error) {
      showAlert('Error al cargar subtipos del tipo', 'error');
    }
  };

  const loadTipos = async () => {
    try {
      const response = await tiposAPI.getAll();
      setTipos(response.data);
    } catch (error) {
      showAlert('Error al cargar tipos', 'error');
    }
  };

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.tipo_id) {
      showAlert('El nombre y tipo son requeridos', 'error');
      return;
    }

    try {
      if (editingSubtipo) {
        await subtiposAPI.update(editingSubtipo.id, formData);
        showAlert('Subtipo actualizado correctamente', 'success');
      } else {
        await subtiposAPI.create(formData);
        showAlert('Subtipo creado correctamente', 'success');
      }

      setShowModal(false);
      setEditingSubtipo(null);
      setFormData({ nombre: '', tipo_id: '' });
      if (selectedTipo) {
        loadSubtiposByTipo(selectedTipo);
      } else {
        loadAllSubtipos();
      }
    } catch (error) {
      showAlert(
        error.response?.data?.error || 'Error al guardar el subtipo',
        'error'
      );
    }
  };

  const handleEdit = (subtipo) => {
    setEditingSubtipo(subtipo);
    setFormData({ nombre: subtipo.nombre, tipo_id: subtipo.tipo_id });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este subtipo?')) {
      return;
    }

    try {
      await subtiposAPI.delete(id);
      showAlert('Subtipo eliminado correctamente', 'success');
      if (selectedTipo) {
        loadSubtiposByTipo(selectedTipo);
      } else {
        loadAllSubtipos();
      }
    } catch (error) {
      showAlert('Error al eliminar el subtipo', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingSubtipo(null);
    setFormData({ nombre: '', tipo_id: selectedTipo || '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSubtipo(null);
    setFormData({ nombre: '', tipo_id: '' });
  };

  const clearFilter = () => {
    setSelectedTipo('');
  };

  if (loading) {
    return <div className="loading">Cargando subtipos...</div>;
  }

  return (
    <div className="eventos">
      <div className="card">
        <div className="card-header">
          <h2>Subtipos</h2>
          <div className="header-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label htmlFor="tipo-filter" style={{ fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaFilter /> Filtrar por Tipo:
              </label>
              <select
                id="tipo-filter"
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  background: 'white',
                  fontSize: '14px'
                }}
              >
                <option value="">Todos los tipos</option>
                {tipos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
              {selectedTipo && (
                <button className="btn btn-secondary" onClick={clearFilter} style={{ padding: '6px 12px', fontSize: '14px' }}>
                  Limpiar Filtro
                </button>
              )}
            </div>
            {canManage && (
              <button className="btn btn-primary" onClick={openCreateModal}>
                <FaPlus /> Nuevo Subtipo
              </button>
            )}
          </div>
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div className="eventos-grid">
          {loading ? (
            <div className="loading">Cargando subtipos...</div>
          ) : subtipos.length === 0 ? (
            <div className="no-data">
              {selectedTipo
                ? 'No hay subtipos para el tipo seleccionado'
                : 'No hay subtipos registrados'
              }
            </div>
          ) : (
            subtipos.map((subtipo, index) => (
              <div key={subtipo.id} className="evento-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="evento-header">
                  <h3>{subtipo.nombre}</h3>
                  {canManage && (
                    <div className="evento-actions">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(subtipo)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(subtipo.id)}
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>

                <div className="evento-content">
                  <div className="evento-details">
                    <div className="detail-item">
                      <span role="img" aria-label="ID">🆔</span>
                      <span>ID: {subtipo.id}</span>
                    </div>
                    <div className="detail-item">
                      <span role="img" aria-label="Tipo">🏷️</span>
                      <span>Tipo: {subtipo.tipo_nombre}</span>
                    </div>
                    <div className="detail-item">
                      <span role="img" aria-label="Fecha">📅</span>
                      <span>Creado: {new Date(subtipo.fecha_creacion).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && canManage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {editingSubtipo ? 'Editar Subtipo' : 'Nuevo Subtipo'}
              </h3>
              <button className="modal-close" onClick={closeModal}>×</button>
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
                  placeholder="Ingrese el nombre del subtipo"
                />
              </div>
              <div className="form-group">
                <label htmlFor="tipo_id">Tipo *</label>
                <select
                  id="tipo_id"
                  value={formData.tipo_id}
                  onChange={(e) => setFormData({ ...formData, tipo_id: e.target.value })}
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  {tipos.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSubtipo ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subtipos;