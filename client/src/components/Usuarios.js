import React, { useState, useEffect } from 'react';
import { usuariosAPI } from '../services/api';
import UsuarioForm from './UsuarioForm';
import UsuarioDetalle from './UsuarioDetalle';
import './Usuarios.css';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [detalleUsuario, setDetalleUsuario] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await usuariosAPI.getAll();
      setUsuarios(response.data);
    } catch (error) {
      showAlert('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      loadUsuarios();
      return;
    }

    try {
      const response = await usuariosAPI.search(term);
      setUsuarios(response.data);
    } catch (error) {
      showAlert('Error en la búsqueda', 'error');
    }
  };

  const handleCreate = () => {
    setEditingUsuario(null);
    setShowModal(true);
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setShowModal(true);
  };

  const handleDetalle = async (usuarioId) => {
    try {
      setDetalleLoading(true);
      const data = await usuariosAPI.getById(usuarioId);
      setDetalleUsuario(data);
      setShowDetalle(true);
    } catch (error) {
      showAlert('Error al cargar el detalle del usuario', 'error');
    } finally {
      setDetalleLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await usuariosAPI.delete(id);
        showAlert('Usuario eliminado correctamente', 'success');
        loadUsuarios();
      } catch (error) {
        showAlert(error.response?.data?.error || 'Error al eliminar usuario', 'error');
      }
    }
  };

  const handleToggleActivo = async (id) => {
    try {
      await usuariosAPI.toggleActivo(id);
      showAlert('Estado actualizado correctamente', 'success');
      loadUsuarios();
    } catch (error) {
      showAlert('Error al actualizar estado', 'error');
    }
  };

  const handleSave = () => {
    setShowModal(false);
    loadUsuarios();
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="usuarios">
      <div className="card">
        <div className="card-header">
          <h2>Gestión de Usuarios</h2>
          <button className="btn btn-primary" onClick={handleCreate}>
            + Nuevo Usuario
          </button>
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, documento o email..."
            value={searchTerm}
            onChange={handleSearch}
          />
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
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.apellido}</td>
                    <td>{usuario.documento}</td>
                    <td>{usuario.email || '-'}</td>
                    <td>{usuario.telefono || '-'}</td>
                    <td>
                      <span className={`badge ${usuario.activo ? 'badge-success' : 'badge-danger'}`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleEdit(usuario)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleDetalle(usuario.id)}
                          disabled={detalleLoading && detalleUsuario?.id === usuario.id}
                        >
                          {detalleLoading && detalleUsuario?.id === usuario.id ? 'Cargando...' : 'Detalle'}
                        </button>
                        <button
                          className={`btn ${usuario.activo ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleToggleActivo(usuario.id)}
                        >
                          {usuario.activo ? 'Inhabilitar' : 'Habilitar'}
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(usuario.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <UsuarioForm
          usuario={editingUsuario}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {showDetalle && detalleUsuario && (
        <UsuarioDetalle
          usuario={detalleUsuario}
          onClose={() => {
            setShowDetalle(false);
            setDetalleUsuario(null);
          }}
        />
      )}
    </div>
  );
};

export default Usuarios;

