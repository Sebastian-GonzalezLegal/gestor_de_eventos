const Evento = require('../models/Evento');
const Vecino = require('../models/Vecino');

class EventoController {
  static async getAll(req, res) {
    try {
      await Evento.disableExpired();
      const eventos = await Evento.findAll();
      res.json(eventos);
    } catch (error) {
      console.error('Error in EventoController.getAll:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getActive(req, res) {
    try {
      await Evento.disableExpired();
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

      // Si es rol subsecretaria, validar que el ID sea el suyo o nulo
      let finalSubsecretariaId = subsecretaria_id;
      if (rol === 'subsecretaria') {
        // Puede asignar su subsecretaria o dejarlo en null (sin asignar)
        // Si intenta asignar otra, se fuerza a null o su subsecretaria dependiendo de lo enviado
        // Pero para ser estrictos según el requerimiento: "asignando su subsecretaria o sin asignar nada"
        if (subsecretaria_id && parseInt(subsecretaria_id) !== userSubsecretariaId) {
             return res.status(403).json({
                error: 'Solo puedes asignar eventos a tu subsecretaria o sin asignar'
             });
        }
        finalSubsecretariaId = subsecretaria_id;
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
      // Manejar error de clave foránea
      if (error.code === 'ER_NO_REFERENCED_ROW_2' || (error.message && error.message.includes('foreign key constraint fails'))) {
        return res.status(400).json({ error: `La subsecretaría, tipo o subtipo seleccionado no es válido. Verifique los IDs: subsecretaria_id=${req.body.subsecretaria_id}, tipo_id=${req.body.tipo_id}, subtipo_id=${req.body.subtipo_id}` });
      }
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

      // Validar si el evento ha expirado
      const today = new Date();
      // Simplificado: fecha local sin hora o comparación estricta de fecha DB vs fecha actual
      // Evento.findById retorna fechas como objetos Date o strings dependiendo del driver
      // MySQL2 devuelve Date objects por defecto.
      const eventoDate = new Date(evento.fecha_evento);
      // Normalizar a medianoche para comparar solo fechas si se desea, o usar lógica de disableExpired
      // Pero disableExpired ya corre en getAll/getActive.
      // Si el evento está inactivo por expiración (activo=0), quizás deberíamos bloquear
      // Pero el usuario dice "cuando expire ... no se debe poder editar".
      
      // Comprobación robusta de fecha
      const now = new Date();
      // Set to beginning of day for date comparison if time is not involved or handled separately
      // But let's follow the logic: if date < now (past day), expired.
      // if date == today, check time.
      const eventDateStr = evento.fecha_evento.toISOString().split('T')[0];
      const todayStr = now.toISOString().split('T')[0];
      
      let isExpired = false;
      if (eventDateStr < todayStr) {
          isExpired = true;
      } else if (eventDateStr === todayStr && evento.hora_evento) {
           // hora_evento comes as string 'HH:MM:SS' usually
           const [h, m] = evento.hora_evento.split(':');
           const eventTime = new Date(now);
           eventTime.setHours(h, m, 0);
           if (now > eventTime) {
               isExpired = true;
           }
      }

      if (isExpired) {
          return res.status(403).json({
              error: 'No se puede editar un evento que ya ha expirado'
          });
      }

      // Validar permisos específicos de subsecretaria
      if (rol === 'subsecretaria') {
        // Solo puede editar eventos de su propia subsecretaria o que no tengan subsecretaria
        if (evento.subsecretaria_id && evento.subsecretaria_id !== userSubsecretariaId) {
             return res.status(403).json({
              error: 'No puedes editar eventos de otra subsecretaria'
            });
        }
      }

      // Si es rol subsecretaria, validar asignación
      let finalSubsecretariaId = subsecretaria_id;
      if (rol === 'subsecretaria') {
        if (subsecretaria_id && parseInt(subsecretaria_id) !== userSubsecretariaId) {
             return res.status(403).json({
                error: 'Solo puedes asignar eventos a tu subsecretaria o sin asignar'
             });
        }
        finalSubsecretariaId = subsecretaria_id;
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
      // Manejar error de clave foránea
      if (error.code === 'ER_NO_REFERENCED_ROW_2' || (error.message && error.message.includes('foreign key constraint fails'))) {
        return res.status(400).json({ error: `La subsecretaría, tipo o subtipo seleccionado no es válido. Verifique los IDs: subsecretaria_id=${req.body.subsecretaria_id}, tipo_id=${req.body.tipo_id}, subtipo_id=${req.body.subtipo_id}` });
      }
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
        // Solo puede eliminar eventos de su propia subsecretaria o sin asignar
        if (evento.subsecretaria_id && evento.subsecretaria_id !== userSubsecretariaId) {
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
          if (eventoExistente.subsecretaria_id && eventoExistente.subsecretaria_id !== userSubsecretariaId) {
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
