const Usuario = require('../models/Usuario');
const RegistroEvento = require('../models/RegistroEvento');

class UsuarioController {
  static async getAll(req, res) {
    try {
      const usuarios = await Usuario.findAll();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findById(id);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Obtener eventos del usuario
      const eventos = await Usuario.getEventosByUsuario(id);
      usuario.eventos = eventos;

      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async search(req, res) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ error: 'Parámetro de búsqueda requerido' });
      }
      
      const usuarios = await Usuario.search(q);
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByDocumento(req, res) {
    try {
      const { documento } = req.params;
      const usuario = await Usuario.findByDocumento(documento);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Obtener eventos del usuario
      const eventos = await Usuario.getEventosByUsuario(usuario.id);
      usuario.eventos = eventos;

      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { nombre, apellido, email, telefono, documento } = req.body;

      if (!nombre || !apellido || !documento) {
        return res.status(400).json({ error: 'Nombre, apellido y documento son requeridos' });
      }

      // Verificar si ya existe el documento
      const existing = await Usuario.findByDocumento(documento);
      if (existing) {
        return res.status(400).json({ error: 'Ya existe un usuario con este documento' });
      }

      const usuario = await Usuario.create({ nombre, apellido, email, telefono, documento });
      res.status(201).json(usuario);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellido, email, telefono, documento } = req.body;

      if (!nombre || !apellido || !documento) {
        return res.status(400).json({ error: 'Nombre, apellido y documento son requeridos' });
      }

      const usuario = await Usuario.findById(id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Verificar si el documento ya existe en otro usuario
      if (documento !== usuario.documento) {
        const existing = await Usuario.findByDocumento(documento);
        if (existing) {
          return res.status(400).json({ error: 'Ya existe otro usuario con este documento' });
        }
      }

      const updated = await Usuario.update(id, { nombre, apellido, email, telefono, documento });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findById(id);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      await Usuario.delete(id);
      res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async toggleActivo(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.toggleActivo(id);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getEventos(req, res) {
    try {
      const { id } = req.params;
      const eventos = await Usuario.getEventosByUsuario(id);
      res.json(eventos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = UsuarioController;

