const Evento = require('../models/Evento');
const Usuario = require('../models/Usuario');

class EventoController {
  static async getAll(req, res) {
    try {
      const eventos = await Evento.findAll();
      res.json(eventos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getActive(req, res) {
    try {
      const eventos = await Evento.findActive();
      res.json(eventos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const evento = await Evento.findById(id);
      
      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      // Obtener usuarios del evento
      const usuarios = await Evento.getUsuariosByEvento(id);
      evento.usuarios = usuarios;

      res.json(evento);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { nombre, descripcion, fecha_evento, hora_evento, lugar } = req.body;

      if (!nombre || !fecha_evento) {
        return res.status(400).json({ error: 'Nombre y fecha del evento son requeridos' });
      }

      const evento = await Evento.create({ nombre, descripcion, fecha_evento, hora_evento, lugar });
      res.status(201).json(evento);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, fecha_evento, hora_evento, lugar } = req.body;

      if (!nombre || !fecha_evento) {
        return res.status(400).json({ error: 'Nombre y fecha del evento son requeridos' });
      }

      const evento = await Evento.findById(id);
      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      const updated = await Evento.update(id, { nombre, descripcion, fecha_evento, hora_evento, lugar });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const evento = await Evento.findById(id);
      
      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      await Evento.delete(id);
      res.json({ message: 'Evento eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async toggleActivo(req, res) {
    try {
      const { id } = req.params;
      const evento = await Evento.toggleActivo(id);
      
      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      res.json(evento);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getUsuarios(req, res) {
    try {
      const { id } = req.params;
      const usuarios = await Evento.getUsuariosByEvento(id);
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = EventoController;

