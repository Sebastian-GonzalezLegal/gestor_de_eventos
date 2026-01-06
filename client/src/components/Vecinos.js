import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaInfoCircle, FaBan, FaCheck, FaSearch, FaTimes, FaHistory } from 'react-icons/fa';
import { vecinosAPI } from '../services/api';
import Modal from './Modal';
import VecinoForm from './VecinoForm';
import VecinoDetalle from './VecinoDetalle';
import ConfirmationModal from './ConfirmationModal';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext'; // Import Notification Hook
import { formatDate } from '../utils/dateUtils';
import './Vecinos.css';

const Vecinos = () => {
  const { isAdmin, isSubsecretaria } = useUser();
  const { showNotification } = useNotification(); // Use notification
  const canManage = isAdmin || isSubsecretaria;
  
  // Data states
  const [allVecinos, setAllVecinos] = useState([]);
  const [vecinos, setVecinos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    estado: 'todos' // todos, activos, inactivos
  });

  // UI states
  const [showModal, setShowModal] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [editingVecino, setEditingVecino] = useState(null);
  const [detalleVecino, setDetalleVecino] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyVecino, setHistoryVecino] = useState(null);
  
  // Confirmation Modal State
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

  useEffect(() => {
    loadVecinos();
  }, []);

  const loadVecinos = async () => {
    try {
      setLoading(true);
      const response = await vecinosAPI.getAll();
      setAllVecinos(response.data);
      setVecinos(response.data);
    } catch (error) {
      showNotification('Error al cargar vecinos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = allVecinos;

    // Search term
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(vecino => 
        vecino.nombre?.toLowerCase().includes(lowerTerm) ||
        vecino.apellido?.toLowerCase().includes(lowerTerm) ||
        vecino.documento?.toLowerCase().includes(lowerTerm) ||
        vecino.email?.toLowerCase().includes(lowerTerm)
      );
    }

    // Estado filter
    if (filters.estado !== 'todos') {
      result = result.filter(vecino => {
        if (filters.estado === 'activos') return vecino.activo;
        if (filters.estado === 'inactivos') return !vecino.activo;
        return true;
      });
    }

    setVecinos(result);
  }, [allVecinos, searchTerm, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreate = () => {
    setEditingVecino(null);
    setShowModal(true);
  };

  const handleEdit = (vecino) => {
    setEditingVecino(vecino);
    setShowModal(true);
  };

  const handleDetalle = async (vecinoId) => {
    try {
      setDetalleLoading(true);
      const data = await vecinosAPI.getById(vecinoId);
      setDetalleVecino(data);
      setShowDetalle(true);
    } catch (error) {
      showNotification('Error al cargar el detalle del vecino', 'error');
    } finally {
      setDetalleLoading(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmation({
      isOpen: true,
      title: 'Eliminar Vecino',
      message: '¿Está seguro que desea eliminar este vecino? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      type: 'danger',
      onConfirm: async () => {
        try {
          await vecinosAPI.delete(id);
          showNotification('Vecino eliminado correctamente', 'success');
          loadVecinos();
        } catch (error) {
          showNotification(error.response?.data?.error || 'Error al eliminar vecino', 'error');
        }
      }
    });
  };

  const handleToggleActivo = async (id) => {
    try {
      await vecinosAPI.toggleActivo(id);
      showNotification('Estado actualizado correctamente', 'success');
      loadVecinos();
    } catch (error) {
      showNotification('Error al actualizar estado', 'error');
    }
  };

  const handleViewHistory = (vecino) => {
    setHistoryVecino(vecino);
    setShowHistoryModal(true);
  };

  const handleSave = () => {
    setShowModal(false);
    loadVecinos();
    showNotification('Vecino guardado correctamente', 'success');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="vecinos">
      <div className="card">
        <div className="card-header">
          <h2>Gestión de Vecinos</h2>
          {canManage && (
            <button className="btn btn-primary" onClick={handleCreate}>
              <FaPlus /> Nuevo Vecino
            </button>
          )}
        </div>

        <div className="filters-container">
          <div className="search-box">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido, documento o email..."
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

          <div className="advanced-filters">
            <div className="filter-group">
              <select
                name="estado"
                value={filters.estado}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="todos">Todos los estados</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Documento</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vecinos.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                    No hay vecinos que coincidan con los filtros
                  </td>
                </tr>
              ) : (
                vecinos.map((vecino) => (
                  <tr key={vecino.id}>
                    <td>{vecino.nombre}</td>
                    <td>{vecino.apellido}</td>
                    <td>{vecino.documento}</td>
                    <td>{vecino.email || '-'}</td>
                    <td>{vecino.telefono || '-'}</td>
                    <td>
                      <span className={`badge ${vecino.activo ? 'badge-success' : 'badge-danger'}`}>
                        {vecino.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      {canManage ? (
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-secondary"
                            onClick={() => handleViewHistory(vecino)}
                            title="Ver historial"
                          >
                            <FaHistory />
                          </button>
                          <button
                            className="btn-icon btn-primary"
                            onClick={() => handleEdit(vecino)}
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn-icon btn-info"
                            onClick={() => handleDetalle(vecino.id)}
                            disabled={detalleLoading && detalleVecino?.id === vecino.id}
                            title="Ver detalle"
                          >
                            <FaInfoCircle />
                          </button>
                          <button
                            className={`btn-icon ${vecino.activo ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleToggleActivo(vecino.id)}
                            title={vecino.activo ? 'Inhabilitar' : 'Habilitar'}
                          >
                            {vecino.activo ? <FaBan /> : <FaCheck />}
                          </button>
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => handleDelete(vecino.id)}
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                            <button
                                className="btn-icon btn-secondary"
                                onClick={() => handleViewHistory(vecino)}
                                title="Ver historial"
                            >
                                <FaHistory />
                            </button>
                            <button
                                className="btn-icon btn-info"
                                onClick={() => handleDetalle(vecino.id)}
                                disabled={detalleLoading && detalleVecino?.id === vecino.id}
                                title="Ver detalle"
                            >
                                <FaInfoCircle />
                            </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Historial */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Historial de Cambios (Estado Anterior)"
      >
        {historyVecino ? (
            historyVecino.datos_anteriores ? (
                (() => {
                    let datos;
                    try {
                        datos = typeof historyVecino.datos_anteriores === 'string'
                            ? JSON.parse(historyVecino.datos_anteriores)
                            : historyVecino.datos_anteriores;
                    } catch (e) {
                        return <p>Error al leer los datos históricos.</p>;
                    }

                    return (
                        <div className="historial-content">
                            <div className="alert alert-info">
                                <p><strong>Fecha del cambio:</strong> {formatDate(datos.fecha_guardado, { withTime: true })}</p>
                            </div>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr><th>Nombre</th><td>{datos.nombre}</td></tr>
                                    <tr><th>Apellido</th><td>{datos.apellido}</td></tr>
                                    <tr><th>Documento</th><td>{datos.documento}</td></tr>
                                    <tr><th>Email</th><td>{datos.email || '-'}</td></tr>
                                    <tr><th>Teléfono</th><td>{datos.telefono || '-'}</td></tr>
                                    <tr><th>Celular</th><td>{datos.celular || '-'}</td></tr>
                                    <tr><th>Fecha Nac.</th><td>{formatDate(datos.fecha_nacimiento, { short: true })}</td></tr>
                                    <tr><th>Dirección</th><td>{datos.calle} {datos.altura} {datos.piso} {datos.departamento}</td></tr>
                                    <tr><th>Barrio Especificación</th><td>{datos.barrio_especificacion || '-'}</td></tr>
                                    <tr><th>Ocupación</th><td>{datos.ocupacion || '-'}</td></tr>
                                    <tr><th>Nacionalidad</th><td>{datos.nacionalidad || '-'}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    );
                })()
            ) : (
                <p className="text-center p-3">No hay historial de cambios disponible para este vecino.</p>
            )
        ) : (
            <p>Cargando...</p>
        )}
        <div className="modal-actions">
            <button type="button" className="btn btn-primary" onClick={() => setShowHistoryModal(false)}>
                Cerrar
            </button>
        </div>
      </Modal>

      {showModal && canManage && (
        <VecinoForm
          vecino={editingVecino}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {showDetalle && detalleVecino && (
        <VecinoDetalle
          vecino={detalleVecino}
          onClose={() => {
            setShowDetalle(false);
            setDetalleVecino(null);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        type={confirmation.type}
      />
    </div>
  );
};

export default Vecinos;
