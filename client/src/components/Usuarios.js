import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaSearch,
  FaEye,
  FaEyeSlash,
  FaHistory
} from 'react-icons/fa';
import { authAPI } from '../services/api';
import Modal from './Modal';
import { useUser } from '../contexts/UserContext';
import './Usuarios.css';

const Usuarios = () => {
  const { user, isAdmin } = useUser();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyUser, setHistoryUser] = useState(null);
  const [showHistoryPassword, setShowHistoryPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'user',
    subsecretaria_id: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [subsecretarias, setSubsecretarias] = useState([]);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsuarios();
    loadSubsecretarias();
  }, []);

  const loadSubsecretarias = async () => {
    try {
      // Necesitamos importar el servicio de subsecretarias
      const response = await fetch('http://localhost:5000/api/subsecretarias', {
         headers: {
             'Authorization': `Bearer ${localStorage.getItem('token')}`
         }
      });
      if(response.ok){
          const data = await response.json();
          setSubsecretarias(data);
      }
    } catch(err){
        console.error('Error cargando subsecretarias', err);
    }
  };

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAllUsers();
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios por búsqueda
  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Abrir modal para crear usuario
  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'user',
      subsecretaria_id: ''
    });
    setShowPassword(false);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  // Abrir modal para editar usuario
  const handleEditUser = (usuario) => {
    setEditingUser(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      subsecretaria_id: usuario.subsecretaria_id || ''
    });
    setShowPassword(false);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  // Guardar usuario (crear o actualizar)
  const handleSaveUser = async (e) => {
    e.preventDefault();

    try {
      const dataToSave = {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
          subsecretaria_id: formData.subsecretaria_id || null
      };

      if (editingUser) {
        // Actualizar usuario
        // Solo incluir contraseña si se proporcionó una nueva
        if (formData.password.trim()) {
          dataToSave.password = formData.password;
        }

        await authAPI.updateUser(editingUser.id, dataToSave);
        setSuccess('Usuario actualizado exitosamente');
      } else {
        // Crear usuario
        dataToSave.password = formData.password;
        await authAPI.register(dataToSave);
        setSuccess('Usuario creado exitosamente');
      }

      setShowModal(false);
      loadUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setError(error.response?.data?.error || 'Error al guardar el usuario');
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (usuario) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar al usuario "${usuario.nombre}"?`)) {
      return;
    }

    try {
      await authAPI.deleteUser(usuario.id);
      setSuccess('Usuario eliminado exitosamente');
      loadUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setError(error.response?.data?.error || 'Error al eliminar el usuario');
    }
  };

  // Toggle estado activo
  const handleToggleActivo = async (usuario) => {
    try {
      await authAPI.toggleUserActivo(usuario.id);
      setSuccess(`Usuario ${usuario.activo ? 'desactivado' : 'activado'} exitosamente`);
      loadUsuarios();
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      setError(error.response?.data?.error || 'Error al cambiar el estado del usuario');
    }
  };

  const handleViewHistory = (usuario) => {
    setHistoryUser(usuario);
    setShowHistoryPassword(false);
    setShowHistoryModal(true);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <FaUsers className="loading-icon" />
        Cargando usuarios...
      </div>
    );
  }

  return (
    <div className="usuarios-container">
      <div className="card">
        <div className="card-header">
          <h2>
            <FaUsers />
            Gestión de Usuarios
          </h2>
          {isAdmin && (
            <button className="btn btn-primary" onClick={handleCreateUser}>
              <FaPlus />
              Nuevo Usuario
            </button>
          )}
        </div>

        {/* Barra de búsqueda */}
        <div className="search-box">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Mensajes de error/éxito */}
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {/* Tabla de usuarios */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios registrados'}
                  </td>
                </tr>
              ) : (
                filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.email}</td>
                    <td>
                      <span className={`badge ${
                        usuario.rol === 'admin' ? 'badge-danger' :
                        usuario.rol === 'visitante' ? 'badge-warning' : 
                        usuario.rol === 'subsecretaria' ? 'badge-info' : 'badge-secondary'
                      }`}>
                        {usuario.rol === 'admin' ? 'Administrador' :
                         usuario.rol === 'visitante' ? 'Visitante' : 
                         usuario.rol === 'subsecretaria' ? 'Subsecretaria' : 'Usuario'}
                      </span>
                      {usuario.rol === 'subsecretaria' && usuario.subsecretaria_nombre && (
                          <div style={{fontSize: '0.8em', color: '#666'}}>
                              ({usuario.subsecretaria_nombre})
                          </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${usuario.activo ? 'badge-success' : 'badge-danger'}`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>{formatDate(usuario.fecha_creacion)}</td>
                    <td>
                      {isAdmin ? (
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-info"
                            onClick={() => handleViewHistory(usuario)}
                            title="Ver historial"
                          >
                            <FaHistory />
                          </button>
                          <button
                            className="btn-icon btn-secondary"
                            onClick={() => handleEditUser(usuario)}
                            title="Editar usuario"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className={`btn-icon ${usuario.activo ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleToggleActivo(usuario)}
                            title={usuario.activo ? 'Desactivar usuario' : 'Activar usuario'}
                          >
                            {usuario.activo ? <FaToggleOff /> : <FaToggleOn />}
                          </button>
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => handleDeleteUser(usuario)}
                            title="Eliminar usuario"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ) : (
                         <div className="action-buttons">
                            <button
                                className="btn-icon btn-info"
                                onClick={() => handleViewHistory(usuario)}
                                title="Ver historial"
                            >
                                <FaHistory />
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
        {historyUser ? (
            historyUser.datos_anteriores ? (
                (() => {
                    let datos;
                    try {
                        datos = typeof historyUser.datos_anteriores === 'string'
                            ? JSON.parse(historyUser.datos_anteriores)
                            : historyUser.datos_anteriores;
                    } catch (e) {
                        return <p>Error al leer los datos históricos.</p>;
                    }
                    
                    // Buscar nombre de subsecretaria si existe
                    const subNombre = datos.subsecretaria_id 
                        ? subsecretarias.find(s => s.id === datos.subsecretaria_id)?.nombre 
                        : null;

                    return (
                        <div className="historial-content">
                            <div className="alert alert-info">
                                <p><strong>Fecha del cambio:</strong> {formatDate(datos.fecha_guardado)}</p>
                            </div>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th>Nombre</th>
                                        <td>{datos.nombre}</td>
                                    </tr>
                                    <tr>
                                        <th>Email</th>
                                        <td>{datos.email}</td>
                                    </tr>
                                    <tr>
                                        <th>Rol</th>
                                        <td>
                                            <span className={`badge ${
                                                datos.rol === 'admin' ? 'badge-danger' :
                                                datos.rol === 'visitante' ? 'badge-warning' : 
                                                datos.rol === 'subsecretaria' ? 'badge-info' : 'badge-secondary'
                                            }`}>
                                                {datos.rol}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Contraseña Anterior</th>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span style={{ marginRight: '10px', fontFamily: 'monospace' }}>
                                                    {showHistoryPassword ? (
                                                        datos.password || 'No registrada'
                                                    ) : (
                                                        '●●●●●●●●'
                                                    )}
                                                </span>
                                                {isAdmin && (
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-sm btn-light" 
                                                        onClick={() => setShowHistoryPassword(!showHistoryPassword)}
                                                        title={showHistoryPassword ? "Ocultar" : "Mostrar"}
                                                    >
                                                        {showHistoryPassword ? <FaEyeSlash /> : <FaEye />}
                                                    </button>
                                                )}
                                            </div>
                                            {showHistoryPassword && datos.password && (
                                                <small className="text-muted d-block mt-1">
                                                    (Hash encriptado)
                                                </small>
                                            )}
                                        </td>
                                    </tr>
                                    {datos.rol === 'subsecretaria' && (
                                        <tr>
                                            <th>Subsecretaría</th>
                                            <td>{subNombre || 'No encontrada (ID: ' + datos.subsecretaria_id + ')'}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <th>Estado</th>
                                        <td>{datos.activo ? 'Activo' : 'Inactivo'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    );
                })()
            ) : (
                <p className="text-center p-3">No hay historial de cambios disponible para este usuario.</p>
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

      {/* Modal para crear/editar usuario - solo visible para admins */}
      {isAdmin && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        >
          <form onSubmit={handleSaveUser}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                placeholder="Ingrese el nombre completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="usuario@municipio.gob.ar"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Contraseña {editingUser ? '(dejar vacío para mantener)' : '*'}
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingUser}
                  placeholder={editingUser ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                  minLength="6"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="rol">Rol *</label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleInputChange}
                required
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
                <option value="visitante">Visitante</option>
                <option value="subsecretaria">Subsecretaria</option>
              </select>
            </div>

            {formData.rol === 'subsecretaria' && (
                <div className="form-group">
                    <label htmlFor="subsecretaria_id">Subsecretaria asignada *</label>
                    <select
                        id="subsecretaria_id"
                        name="subsecretaria_id"
                        value={formData.subsecretaria_id}
                        onChange={handleInputChange}
                        required={formData.rol === 'subsecretaria'}
                    >
                        <option value="">Seleccione una subsecretaria</option>
                        {subsecretarias.map(sub => (
                            <option key={sub.id} value={sub.id}>
                                {sub.nombre}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editingUser ? 'Actualizar' : 'Crear'} Usuario
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Usuarios;
