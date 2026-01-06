import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaList, FaIdCard, FaCalendarAlt, FaTimes, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { tiposAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import './Tipos.css';

const Tipos = () => {
  const { isAdmin, isSubsecretaria } = useUser();
  const { showNotification } = useNotification();
  const canManage = isAdmin || isSubsecretaria;
  const navigate = useNavigate();
  const [allTipos, setAllTipos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTipo, setEditingTipo] = useState(null);
  const [formData, setFormData] = useState({ nombre: '' });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTipos();
  }, []);

  const loadTipos = async () => {
    try {
      setLoading(true);
      const response = await tiposAPI.getAll();
      setAllTipos(response.data);
      setTipos(response.data);
    } catch (error) {
      showNotification('Error al cargar tipos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = allTipos;
    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        result = result.filter(t => t.nombre.toLowerCase().includes(lower));
    }
    setTipos(result);
  }, [allTipos, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      showNotification('El nombre es requerido', 'error');
      return;
    }

    try {
      if (editingTipo) {
        await tiposAPI.update(editingTipo.id, formData);
        showNotification('Tipo actualizado correctamente', 'success');
      } else {
        await tiposAPI.create(formData);
        showNotification('Tipo creado correctamente', 'success');
      }

      setShowModal(false);
      setEditingTipo(null);
      setFormData({ nombre: '' });
      loadTipos();
    } catch (error) {
      showNotification(
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
      showNotification('Tipo eliminado correctamente', 'success');
      loadTipos();
    } catch (error) {
      showNotification('Error al eliminar el tipo', 'error');
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
          {canManage && (
            <button className="btn btn-primary" onClick={openCreateModal}>
              <FaPlus /> Nuevo Tipo
            </button>
          )}
        </div>

        <div className="filters-container">
            <div className="search-box">
                <div className="search-input-container">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Buscar tipo..."
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

        <div className="tipos-grid">
          {tipos.length === 0 ? (
            <div className="no-data">No hay tipos que coincidan con la búsqueda</div>
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
                        navigate('/subtipos');
                      }}
                      title="Ver Subtipos"
                    >
                      <FaList /> Subtipos
                    </button>
                    {canManage && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>

                <div className="tipo-content">
                  <div className="tipo-details">
                    <div className="detail-item">
                      <FaIdCard className="detail-icon" />
                      <span>ID: {tipo.id}</span>
                    </div>
                    <div className="detail-item">
                      <FaCalendarAlt className="detail-icon" />
                      <span>Creado: {new Date(tipo.fecha_creacion).toLocaleDateString('es-ES')}</span>
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
                {editingTipo ? 'Editar Tipo' : 'Nuevo Tipo'}
              </h3>
              <button className="close-btn" onClick={closeModal}><FaTimes /></button>
            </div>
            <div className="modal-body">
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
                <div className="modal-actions">
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
        </div>
      )}
    </div>
  );
};

export default Tipos;
