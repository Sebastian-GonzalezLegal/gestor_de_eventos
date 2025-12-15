const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

class AuthController {
  // Generar token JWT
  static generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol,
        nombre: user.nombre,
        subsecretaria_id: user.subsecretaria_id
      },
      process.env.JWT_SECRET || 'tu_clave_secreta_jwt',
      { expiresIn: '24h' }
    );
  }

  // Verificar token JWT
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_jwt');
    } catch (error) {
      return null;
    }
  }

  // Login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Email y contraseña son requeridos'
        });
      }

      const user = await Usuario.authenticate(email, password);

      if (!user) {
        return res.status(401).json({
          error: 'Credenciales inválidas'
        });
      }

      const token = AuthController.generateToken(user);

      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          subsecretaria_id: user.subsecretaria_id
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Registro de usuarios (solo para usuarios autenticados)
  static async register(req, res) {
    try {
      const { nombre, email, password, rol, subsecretaria_id } = req.body;

      // Verificar que el usuario que registra esté autenticado
      if (!req.user) {
        return res.status(401).json({
          error: 'Debes estar autenticado para registrar usuarios'
        });
      }

      if (!nombre || !email || !password) {
        return res.status(400).json({
          error: 'Nombre, email y contraseña son requeridos'
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Formato de email inválido'
        });
      }

      // Validar longitud de contraseña
      if (password.length < 6) {
        return res.status(400).json({
          error: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      // Solo admins pueden crear usuarios (visitantes no pueden crear nada)
      if (req.user.rol !== 'admin') {
        return res.status(403).json({
          error: 'Solo los administradores pueden crear usuarios'
        });
      }

      // Solo admins pueden crear otros admins
      if (rol === 'admin' && req.user.rol !== 'admin') {
        return res.status(403).json({
          error: 'Solo los administradores pueden crear usuarios administradores'
        });
      }
      
      // Si el rol es subsecretaria, se requiere subsecretaria_id
      if (rol === 'subsecretaria' && !subsecretaria_id) {
          return res.status(400).json({
              error: 'Para el rol de subsecretaria, se debe especificar una subsecretaria'
          });
      }

      // Verificar si el email ya existe
      const existingUser = await Usuario.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          error: 'Ya existe un usuario con este email'
        });
      }

      const userData = {
        nombre,
        email,
        password,
        rol: rol || 'user',
        subsecretaria_id: subsecretaria_id || null
      };

      const newUser = await Usuario.create(userData);

      // No devolver la contraseña
      const { password: _, ...userResponse } = newUser;

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: userResponse
      });
    } catch (error) {
      console.error('Error en registro:', error);
      // Manejar error de clave foránea si subsecretaria_id es inválido
      if (error.code === 'ER_NO_REFERENCED_ROW_2' || (error.message && error.message.includes('foreign key constraint fails'))) {
        return res.status(400).json({ error: 'La subsecretaría seleccionada no es válida.' });
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Verificar token y devolver información del usuario
  static async verify(req, res) {
    try {
      // El middleware ya verificó el token, req.user contiene la información
      if (!req.user) {
        return res.status(401).json({
          error: 'Token inválido'
        });
      }

      res.json({
        user: req.user
      });
    } catch (error) {
      console.error('Error en verificación:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener todos los usuarios (admins, subsecretarias y visitantes pueden ver)
  static async getAll(req, res) {
    try {
      if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'visitante' && req.user.rol !== 'subsecretaria')) {
        return res.status(403).json({
          error: 'No tienes permisos para ver usuarios'
        });
      }

      const usuarios = await Usuario.findAll();
      res.json(usuarios);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Actualizar usuario
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, email, password, rol, subsecretaria_id } = req.body;

      // Solo admins pueden actualizar usuarios
      if (req.user.rol !== 'admin') {
        return res.status(403).json({
          error: 'Solo los administradores pueden actualizar usuarios'
        });
      }

      // Solo admins pueden cambiar roles
      if (rol && req.user.rol !== 'admin') {
        return res.status(403).json({
          error: 'Solo los administradores pueden cambiar roles'
        });
      }
      
      // Si el rol es subsecretaria, se requiere subsecretaria_id
      if (rol === 'subsecretaria' && !subsecretaria_id) {
           return res.status(400).json({
              error: 'Para el rol de subsecretaria, se debe especificar una subsecretaria'
           });
      }

      const userData = {};
      if (nombre) userData.nombre = nombre;
      if (email) userData.email = email;
      if (password) userData.password = password;
      if (rol && req.user.rol === 'admin') userData.rol = rol;
      if (req.user.rol === 'admin') userData.subsecretaria_id = subsecretaria_id || null;

      if (Object.keys(userData).length === 0) {
        return res.status(400).json({
          error: 'Debes proporcionar al menos un campo para actualizar'
        });
      }

      const updatedUser = await Usuario.update(id, userData);

      if (!updatedUser) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }

      // No devolver contraseña
      const { password: _, ...userResponse } = updatedUser;

      res.json({
        message: 'Usuario actualizado exitosamente',
        user: userResponse
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      // Manejar error de clave foránea si subsecretaria_id es inválido
      if (error.code === 'ER_NO_REFERENCED_ROW_2' || (error.message && error.message.includes('foreign key constraint fails'))) {
        return res.status(400).json({ error: 'La subsecretaría seleccionada no es válida.' });
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Eliminar usuario (solo admins)
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Solo admins pueden eliminar usuarios
      if (req.user.rol !== 'admin') {
        return res.status(403).json({
          error: 'Solo los administradores pueden eliminar usuarios'
        });
      }

      // No permitir eliminar al propio usuario
      if (req.user.id == id) {
        return res.status(400).json({
          error: 'No puedes eliminar tu propio usuario'
        });
      }

      const user = await Usuario.findById(id);
      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }

      await Usuario.delete(id);
      res.json({
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Cambiar estado activo/inactivo (solo admins)
  static async toggleActivo(req, res) {
    try {
      const { id } = req.params;

      // Solo admins pueden cambiar el estado de usuarios
      if (req.user.rol !== 'admin') {
        return res.status(403).json({
          error: 'Solo los administradores pueden cambiar el estado de usuarios'
        });
      }

      // No permitir desactivar al propio usuario
      if (req.user.id == id) {
        return res.status(400).json({
          error: 'No puedes cambiar el estado de tu propio usuario'
        });
      }

      const user = await Usuario.toggleActivo(id);

      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }

      res.json({
        message: 'Estado del usuario actualizado exitosamente',
        user
      });
    } catch (error) {
      console.error('Error al cambiar estado de usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = AuthController;
