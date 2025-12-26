import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaIdCard, FaCalendarAlt, FaTimes, FaSearch } from 'react-icons/fa';
import { subsecretariasAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';
import './Vecinos.css';

const Subsecretarias = () => {
  const { isAdmin } = useUser();
  const [allSubsecretarias, setAllSubsecretarias] = useState([]);
  const [subsecretarias, setSubsecretarias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubsecretaria, setEditingSubsecretaria] = useState(null);
  const [formData, setFormData] = useState({ nombre: '' });
  const [alert, setAlert] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSubsecretarias();
  }, []);

  const loadSubsecretarias = async () => {
    try {
      setLoading(true);
      const response = await subsecretariasAPI.getAll();
      setAllSubsecretarias(response.data);
      setSubsecretarias(response.data);
    } catch (error) {
      showAlert('Error al cargar subsecretarías', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = allSubsecretarias;
    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        result = result.filter(s => s.nombre.toLowerCase().includes(lower));
    }
    setSubsecretarias(result);
  }, [allSubsecretarias, searchTerm]);

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
      if (editingSubsecretaria) {
        await subsecretariasAPI.update(editingSubsecretaria.id, formData);
        showAlert('Subsecretaría actualizada correctamente', 'success');
      } else {
        await subsecretariasAPI.create(formData);
        showAlert('Subsecretaría creada correctamente', 'success');
      }

      setShowModal(false);
      setEditingSubsecretaria(null);
      setFormData({ nombre: '' });
      loadSubsecretarias();
    } catch (error) {
      showAlert(
        error.response?.data?.error || 'Error al guardar la subsecretaría',
        'error'
      );
    }
  };

  const handleEdit = (subsecretaria) => {
    setEditingSubsecretaria(subsecretaria);
    setFormData({ nombre: subsecretaria.nombre });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta subsecretaría?')) {
      return;
    }

    try {
      await subsecretariasAPI.delete(id);
      showAlert('Subsecretaría eliminada correctamente', 'success');
      loadSubsecretarias();
    } catch (error) {
      showAlert('Error al eliminar la subsecretaría', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingSubsecretaria(null);
    setFormData({ nombre: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSubsecretaria(null);
    setFormData({ nombre: '' });
  };

  if (loading) {
    return <div className="loading">Cargando subsecretarías...</div>;
  }

  return (
    <div className="eventos">
      <div className="card">
        <div className="card-header">
          <h2>Subsecretarías</h2>
          {isAdmin && (
            <button className="btn btn-primary" onClick={openCreateModal}>
              <FaPlus /> Nueva Subsecretaría
            </button>
          )}
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div className="filters-container">
            <div className="search-box">
                <div className="search-input-container">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Buscar subsecretaría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                     {searchTerm && (
                        <button
                          type="button"
                          className="clear-search"
                          onClick={() => setSearchTerm('')}
                          title="Limpiar búsqueda"
                        >
                          <FaTimes />
                        </button>
                      )}
                </div>
            </div>
        </div>

        <div className="eventos-grid">
          {loading ? (
            <div className="loading">Cargando subsecretarías...</div>
          ) : subsecretarias.length === 0 ? (
            <div className="no-data">No hay subsecretarías que coincidan con la búsqueda</div>
          ) : (
            subsecretarias.map((subsecretaria, index) => (
              <div key={subsecretaria.id} className="evento-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="evento-header">
                  <h3>{subsecretaria.nombre}</h3>
                  {isAdmin && (
                    <div className="evento-actions">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(subsecretaria)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(subsecretaria.id)}
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
                      <FaIdCard className="detail-icon" />
                      <span>ID: {subsecretaria.id}</span>
                    </div>
                    <div className="detail-item">
                      <FaCalendarAlt className="detail-icon" />
                      <span>Creado: {new Date(subsecretaria.fecha_creacion).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && isAdmin && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {editingSubsecretaria ? 'Editar Subsecretaría' : 'Nueva Subsecretaría'}
              </h3>
              <button className="modal-close" onClick={closeModal}><FaTimes /></button>
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
                  placeholder="Ingrese el nombre de la subsecretaría"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSubsecretaria ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subsecretarias;