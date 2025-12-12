import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaInfoCircle, FaBan, FaCheck, FaSearch } from 'react-icons/fa';
import { vecinosAPI } from '../services/api';
import VecinoForm from './VecinoForm';
import VecinoDetalle from './VecinoDetalle';
import { useUser } from '../contexts/UserContext';
import './Vecinos.css';

const Vecinos = () => {
  const { isAdmin } = useUser();
  const [vecinos, setVecinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [editingVecino, setEditingVecino] = useState(null);
  const [detalleVecino, setDetalleVecino] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadVecinos();
  }, []);

  const loadVecinos = async () => {
    try {
      setLoading(true);
      const response = await vecinosAPI.getAll();
      setVecinos(response.data);
    } catch (error) {
      showAlert('Error al cargar vecinos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === '') {
      loadVecinos();
      return;
    }

    try {
      const response = await vecinosAPI.search(term);
      setVecinos(response.data);
    } catch (error) {
      showAlert('Error en la búsqueda', 'error');
    }
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
      showAlert('Error al cargar el detalle del vecino', 'error');
    } finally {
      setDetalleLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este vecino?')) {
      try {
        await vecinosAPI.delete(id);
        showAlert('Vecino eliminado correctamente', 'success');
        loadVecinos();
      } catch (error) {
        showAlert(error.response?.data?.error || 'Error al eliminar vecino', 'error');
      }
    }
  };

  const handleToggleActivo = async (id) => {
    try {
      await vecinosAPI.toggleActivo(id);
      showAlert('Estado actualizado correctamente', 'success');
      loadVecinos();
    } catch (error) {
      showAlert('Error al actualizar estado', 'error');
    }
  };

  const handleSave = () => {
    setShowModal(false);
    loadVecinos();
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="vecinos">
      <div className="card">
        <div className="card-header">
          <h2>Gestión de Vecinos</h2>
          {isAdmin && (
            <button className="btn btn-primary" onClick={handleCreate}>
              <FaPlus /> Nuevo Vecino
            </button>
          )}
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div className="search-box">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, documento o email..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() => {
                  setSearchTerm('');
                  loadVecinos();
                }}
                title="Limpiar búsqueda"
              >
                ×
              </button>
            )}
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
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    No hay vecinos registrados
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
                      {isAdmin ? (
                        <div className="action-buttons">
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleEdit(vecino)}
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn-detalle"
                            onClick={() => handleDetalle(vecino.id)}
                            disabled={detalleLoading && detalleVecino?.id === vecino.id}
                            title="Ver detalle"
                          >
                            <FaInfoCircle /> {detalleLoading && detalleVecino?.id === vecino.id ? 'Cargando...' : ''}
                          </button>
                          <button
                            className={`btn ${vecino.activo ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleToggleActivo(vecino.id)}
                            title={vecino.activo ? 'Inhabilitar' : 'Habilitar'}
                          >
                            {vecino.activo ? <><FaBan /></> : <><FaCheck /></>}
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(vecino.id)}
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn-detalle"
                          onClick={() => handleDetalle(vecino.id)}
                          disabled={detalleLoading && detalleVecino?.id === vecino.id}
                          title="Ver detalle"
                        >
                          <FaInfoCircle /> {detalleLoading && detalleVecino?.id === vecino.id ? 'Cargando...' : ''}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && isAdmin && (
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
    </div>
  );
};

export default Vecinos;