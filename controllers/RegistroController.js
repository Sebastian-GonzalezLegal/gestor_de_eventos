const RegistroEvento = require('../models/RegistroEvento');
const Usuario = require('../models/Usuario');
const Evento = require('../models/Evento');

class RegistroController {
  static async getAll(req, res) {
    try {
      const registros = await RegistroEvento.findAll();
      res.json(registros);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const registro = await RegistroEvento.findById(id);
      
      if (!registro) {
        return res.status(404).json({ error: 'Registro no encontrado' });
      }

      res.json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { usuario_id, evento_id, notas } = req.body;

      if (!usuario_id || !evento_id) {
        return res.status(400).json({ error: 'Usuario y evento son requeridos' });
      }

      // Verificar que el usuario existe
      const usuario = await Usuario.findById(usuario_id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Verificar que el evento existe
      const evento = await Evento.findById(evento_id);
      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      const registro = await RegistroEvento.create({ usuario_id, evento_id, notas });
      res.status(201).json(registro);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const registro = await RegistroEvento.findById(id);
      
      if (!registro) {
        return res.status(404).json({ error: 'Registro no encontrado' });
      }

      await RegistroEvento.delete(id);
      res.json({ message: 'Registro eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async registerByDocumento(req, res) {
    try {
      const { documento, evento_id, notas } = req.body;

      if (!documento || !evento_id) {
        return res.status(400).json({ error: 'Documento y evento son requeridos' });
      }

      // Buscar usuario por documento
      const usuario = await Usuario.findByDocumento(documento);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado. Debe registrarlo primero.' });
      }

      // Verificar que el evento existe
      const evento = await Evento.findById(evento_id);
      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      // Verificar si ya está registrado
      const existing = await RegistroEvento.findByUsuarioAndEvento(usuario.id, evento_id);
      if (existing) {
        return res.status(400).json({ 
          error: 'El usuario ya está registrado en este evento',
          usuario,
          evento
        });
      }

      const registro = await RegistroEvento.create({ 
        usuario_id: usuario.id, 
        evento_id, 
        notas 
      });
      
      res.status(201).json({
        registro,
        usuario,
        evento
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = RegistroController;

