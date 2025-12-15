const Evento = require('../models/Evento');
const Vecino = require('../models/Vecino');

class EventoController {
  static async getAll(req, res) {
    try {
      const eventos = await Evento.findAll();
      res.json(eventos);
    } catch (error) {
      console.error('Error in EventoController.getAll:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getActive(req, res) {
    try {
      const eventos = await Evento.findActive();
      res.json(eventos);
    } catch (error) {
      console.error('Error in EventoController.getActive:', error);
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
      const { rol, subsecretaria_id: userSubsecretariaId } = req.user;
      
      // Permitir crear a admins y subsecretarias
      if (rol !== 'admin' && rol !== 'subsecretaria') {
        return res.status(403).json({
          error: 'No tienes permisos para crear eventos'
        });
      }

      const { nombre, descripcion, fecha_evento, hora_evento, lugar, subsecretaria_id, tipo_id, subtipo_id } = req.body;

      console.log('Datos recibidos para crear evento:', { nombre, descripcion, fecha_evento, hora_evento, lugar, subsecretaria_id, tipo_id, subtipo_id });

      if (!nombre || !fecha_evento) {
        return res.status(400).json({ error: 'Nombre y fecha del evento son requeridos' });
      }

      // Si es rol subsecretaria, forzar el ID de su subsecretaria
      let finalSubsecretariaId = subsecretaria_id;
      if (rol === 'subsecretaria') {
        finalSubsecretariaId = userSubsecretariaId;
      }

      const evento = await Evento.create({ 
        nombre, 
        descripcion, 
        fecha_evento, 
        hora_evento, 
        lugar, 
        subsecretaria_id: finalSubsecretariaId, 
        tipo_id, 
        subtipo_id 
      });
      res.status(201).json(evento);
    } catch (error) {
      console.error('Error al crear evento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { rol, subsecretaria_id: userSubsecretariaId } = req.user;
      const { id } = req.params;
      
      // Permitir actualizar a admins y subsecretarias
      if (rol !== 'admin' && rol !== 'subsecretaria') {
        return res.status(403).json({
          error: 'No tienes permisos para actualizar eventos'
        });
      }

      const { nombre, descripcion, fecha_evento, hora_evento, lugar, subsecretaria_id, tipo_id, subtipo_id } = req.body;

      console.log('Datos recibidos para actualizar evento:', { id, nombre, descripcion, fecha_evento, hora_evento, lugar, subsecretaria_id, tipo_id, subtipo_id });

      if (!nombre || !fecha_evento) {
        return res.status(400).json({ error: 'Nombre y fecha del evento son requeridos' });
      }

      const evento = await Evento.findById(id);
      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      // Validar permisos específicos de subsecretaria
      if (rol === 'subsecretaria') {
        // Solo puede editar eventos de su propia subsecretaria
        if (evento.subsecretaria_id !== userSubsecretariaId) {
             return res.status(403).json({
              error: 'No puedes editar eventos de otra subsecretaria'
            });
        }
      }

      // Si es rol subsecretaria, asegurar que no cambie la subsecretaria a otra
      let finalSubsecretariaId = subsecretaria_id;
      if (rol === 'subsecretaria') {
        finalSubsecretariaId = userSubsecretariaId;
      }

      const updated = await Evento.update(id, { 
        nombre, 
        descripcion, 
        fecha_evento, 
        hora_evento, 
        lugar, 
        subsecretaria_id: finalSubsecretariaId, 
        tipo_id, 
        subtipo_id 
      });
      res.json(updated);
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { rol, subsecretaria_id: userSubsecretariaId } = req.user;
      const { id } = req.params;

      // Permitir eliminar a admins y subsecretarias
      if (rol !== 'admin' && rol !== 'subsecretaria') {
        return res.status(403).json({
          error: 'No tienes permisos para eliminar eventos'
        });
      }

      const evento = await Evento.findById(id);
      
      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      // Validar permisos específicos de subsecretaria
      if (rol === 'subsecretaria') {
        // Solo puede eliminar eventos de su propia subsecretaria
        if (evento.subsecretaria_id !== userSubsecretariaId) {
             return res.status(403).json({
              error: 'No puedes eliminar eventos de otra subsecretaria'
            });
        }
      }

      await Evento.delete(id);
      res.json({ message: 'Evento eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async toggleActivo(req, res) {
    try {
      const { rol, subsecretaria_id: userSubsecretariaId } = req.user;
      const { id } = req.params;

      // Permitir cambiar estado a admins y subsecretarias
      if (rol !== 'admin' && rol !== 'subsecretaria') {
        return res.status(403).json({
          error: 'No tienes permisos para cambiar el estado de eventos'
        });
      }

      // Necesitamos buscar el evento primero para verificar permisos de subsecretaria
      const eventoExistente = await Evento.findById(id);
      if (!eventoExistente) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      if (rol === 'subsecretaria') {
          if (eventoExistente.subsecretaria_id !== userSubsecretariaId) {
               return res.status(403).json({
                error: 'No puedes cambiar el estado de eventos de otra subsecretaria'
              });
          }
      }

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
