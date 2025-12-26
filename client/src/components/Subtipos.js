import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaFilter, FaIdCard, FaTag, FaCalendarAlt, FaTimes, FaSearch } from 'react-icons/fa';
import { subtiposAPI, tiposAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';
import './Vecinos.css';

const Subtipos = () => {
  const { isAdmin, isSubsecretaria } = useUser();
  const canManage = isAdmin || isSubsecretaria;
  const [allSubtipos, setAllSubtipos] = useState([]);
  const [subtipos, setSubtipos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubtipo, setEditingSubtipo] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', tipo_id: '' });
  const [selectedTipo, setSelectedTipo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
    filterSubtipos();
  }, [allSubtipos, selectedTipo, searchTerm]);

  const filterSubtipos = () => {
    let result = allSubtipos;

    if (selectedTipo) {
        result = result.filter(s => s.tipo_id.toString() === selectedTipo);
    }

    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        result = result.filter(s => s.nombre.toLowerCase().includes(lower));
    }

    setSubtipos(result);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [subtiposRes, tiposRes] = await Promise.all([
        subtiposAPI.getAll(),
        tiposAPI.getAll()
      ]);
      setAllSubtipos(subtiposRes.data);
      setSubtipos(subtiposRes.data);
      setTipos(tiposRes.data);
    } catch (error) {
      showAlert('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAllSubtipos = async () => {
    try {
      const response = await subtiposAPI.getAll();
      setAllSubtipos(response.data);
    } catch (error) {
      showAlert('Error al cargar subtipos', 'error');
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
      loadAllSubtipos();
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
      loadAllSubtipos();
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
    setSearchTerm('');
  };

  if (loading) {
    return <div className="loading">Cargando subtipos...</div>;
  }

  return (
    <div className="eventos">
      <div className="card">
        <div className="card-header">
          <h2>Subtipos</h2>
          {canManage && (
              <button className="btn btn-primary" onClick={openCreateModal}>
                <FaPlus /> Nuevo Subtipo
              </button>
            )}
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div className="filters-container">
            <div className="advanced-filters">
                <div className="search-box filter-group" style={{ flex: 2 }}>
                    <div className="search-input-container">
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Buscar subtipo..."
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
                <div className="filter-group">
                    <select
                        id="tipo-filter"
                        value={selectedTipo}
                        onChange={(e) => setSelectedTipo(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Todos los tipos</option>
                        {tipos.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                            {tipo.nombre}
                        </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        <div className="eventos-grid">
          {loading ? (
            <div className="loading">Cargando subtipos...</div>
          ) : subtipos.length === 0 ? (
            <div className="no-data">
               No hay subtipos que coincidan con los filtros
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
                      <FaIdCard className="detail-icon" />
                      <span>ID: {subtipo.id}</span>
                    </div>
                    <div className="detail-item">
                      <FaTag className="detail-icon" />
                      <span>Tipo: {subtipo.tipo_nombre}</span>
                    </div>
                    <div className="detail-item">
                      <FaCalendarAlt className="detail-icon" />
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