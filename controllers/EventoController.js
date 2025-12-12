const Evento = require('../models/Evento');
const Vecino = require('../models/Vecino');

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

      // Obtener vecinos del evento
      const vecinos = await Evento.getVecinosByEvento(id);
      evento.vecinos = vecinos;

      res.json(evento);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      // Solo admins pueden crear eventos
      if (req.user.rol !== 'admin') {
        return res.status(403).json({
          error: 'Solo los administradores pueden crear eventos'
        });
      }

      const { nombre, descripcion, fecha_evento, hora_evento, lugar, subsecretaria_id, tipo_id, subtipo_id } = req.body;

      console.log('Datos recibidos para crear evento:', { nombre, descripcion, fecha_evento, hora_evento, lugar, subsecretaria_id, tipo_id, subtipo_id });

      if (!nombre || !fecha_evento) {
        return res.status(400).json({ error: 'Nombre y fecha del evento son requeridos' });
      }

      const evento = await Evento.create({ nombre, descripcion, fecha_evento, hora_evento, lugar, subsecretaria_id, tipo_id, subtipo_id });
      res.status(201).json(evento);
    } catch (error) {
      console.error('Error al crear evento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      // Solo admins pueden actualizar eventos
      if (req.user.rol !== 'admin') {
        return res.status(403).json({
          error: 'Solo los administradores pueden actualizar eventos'
        });
      }

      const { id } = req.params;
      const { nombre, descripcion, fecha_evento, hora_evento, lugar, subsecretaria_id, tipo_id, subtipo_id } = req.body;

      console.log('Datos recibidos para actualizar evento:', { id, nombre, descripcion, fecha_evento, hora_evento, lugar, subsecretaria_id, tipo_id, subtipo_id });

      if (!nombre || !fecha_evento) {
        return res.status(400).json({ error: 'Nombre y fecha del evento son requeridos' });
      }

      const evento = await Evento.findById(id);
      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      const updated = await Evento.update(id, { nombre, descripcion, fecha_evento, hora_evento, lugar, subsecretaria_id, tipo_id, subtipo_id });
      res.json(updated);
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      // Solo admins pueden eliminar eventos
      if (req.user.rol !== 'admin') {
        return res.status(403).json({
          error: 'Solo los administradores pueden eliminar eventos'
        });
      }

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
      // Solo admins pueden cambiar el estado de eventos
      if (req.user.rol !== 'admin') {
        return res.status(403).json({
          error: 'Solo los administradores pueden cambiar el estado de eventos'
        });
      }

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

  static async getVecinos(req, res) {
    try {
      const { id } = req.params;
      const vecinos = await Evento.getVecinosByEvento(id);
      res.json(vecinos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = EventoController;

