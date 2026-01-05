const RegistroEvento = require('../models/RegistroEvento');
const Vecino = require('../models/Vecino');
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
      const { rol, subsecretaria_id: userSubsecretariaId } = req.user;

      // Los visitantes no pueden inscribir a nadie
      if (rol === 'visitante') {
        return res.status(403).json({
          error: 'Los visitantes no pueden realizar inscripciones'
        });
      }

      const { vecino_id, evento_id, notas } = req.body;

      if (!vecino_id || !evento_id) {
        return res.status(400).json({ error: 'Vecino y evento son requeridos' });
      }

      const parsedVecinoId = parseInt(vecino_id);
      const parsedEventoId = parseInt(evento_id);

      // Verificar que el vecino existe
      const vecino = await Vecino.findById(parsedVecinoId);
      if (!vecino) {
        return res.status(404).json({ error: 'Vecino no encontrado' });
      }

      // Verificar que el evento existe
      const evento = await Evento.findById(parsedEventoId);
      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      // Validar permisos de subsecretaria
      if (rol === 'subsecretaria') {
        // Puede asignar a eventos de su subsecretaria O a eventos sin subsecretaria
        if (evento.subsecretaria_id && evento.subsecretaria_id !== userSubsecretariaId) {
             return res.status(403).json({
                error: 'Solo puedes asignar vecinos a eventos de tu subsecretaria o generales'
             });
        }
      }

      const registro = await RegistroEvento.create({ 
        vecino_id: parsedVecinoId, 
        evento_id: parsedEventoId, 
        notas 
      });
      res.status(201).json(registro);
    } catch (error) {
      // Manejar error de clave foránea (posiblemente vecino o evento eliminado concurrentemente)
      if (error.code === 'ER_NO_REFERENCED_ROW_2' || (error.message && error.message.includes('foreign key constraint fails'))) {
        console.error(`Error FK al registrar: vecino_id=${req.body.vecino_id}, evento_id=${req.body.evento_id}`);
        return res.status(400).json({ 
          error: `No se pudo crear el registro: El vecino (ID: ${req.body.vecino_id}) o evento (ID: ${req.body.evento_id}) no existen (o fueron eliminados).` 
        });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { rol, subsecretaria_id: userSubsecretariaId } = req.user;

      // Los visitantes no pueden eliminar registros
      if (rol === 'visitante') {
        return res.status(403).json({
          error: 'Los visitantes no pueden eliminar registros'
        });
      }

      const { id } = req.params;
      const registro = await RegistroEvento.findById(id);
      
      if (!registro) {
        return res.status(404).json({ error: 'Registro no encontrado' });
      }

      // Verificar permisos para eliminar
      if (rol === 'subsecretaria') {
         // Necesitamos saber el evento del registro para validar
         // Asumimos que RegistroEvento.findById devuelve info del evento o hacemos un join
         // Si no, buscamos el evento
         // En el modelo RegistroEvento.js, findById hace JOIN con eventos?
         // Revisemos RegistroEvento.js si fuera necesario, pero asumamos que necesitamos el evento
         
         // En realidad, el registro tiene evento_id. Consultamos el evento.
         const evento = await Evento.findById(registro.evento_id);
         if (evento && evento.subsecretaria_id && evento.subsecretaria_id !== userSubsecretariaId) {
             return res.status(403).json({
                 error: 'No puedes eliminar registros de eventos de otra subsecretaria'
             });
         }
      }

      await RegistroEvento.delete(id);
      res.json({ message: 'Registro eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async registerByDocumento(req, res) {
    try {
      const { rol, subsecretaria_id: userSubsecretariaId } = req.user;

      // Los visitantes no pueden inscribir a nadie
      if (rol === 'visitante') {
        return res.status(403).json({
          error: 'Los visitantes no pueden realizar inscripciones'
        });
      }
      const { documento, evento_id, notas } = req.body;

      if (!documento || !evento_id) {
        return res.status(400).json({ error: 'Documento y evento son requeridos' });
      }

      // Buscar vecino por documento
      const vecino = await Vecino.findByDocumento(documento);
      if (!vecino) {
        return res.status(404).json({ error: 'Vecino no encontrado. Debe registrarlo primero.' });
      }

      // Verificar que el evento existe
      const evento = await Evento.findById(evento_id);
      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      // Validar permisos de subsecretaria
      if (rol === 'subsecretaria') {
        // Puede asignar a eventos de su subsecretaria O a eventos sin subsecretaria
        if (evento.subsecretaria_id && evento.subsecretaria_id !== userSubsecretariaId) {
             return res.status(403).json({
                error: 'Solo puedes asignar vecinos a eventos de tu subsecretaria o generales'
             });
        }
      }

      // Verificar si ya está registrado
      const existing = await RegistroEvento.findByVecinoAndEvento(vecino.id, evento_id);
      if (existing) {
        return res.status(400).json({
          error: 'El vecino ya está registrado en este evento',
          vecino,
          evento
        });
      }

      const parsedEventoId = parseInt(evento_id);
      
      const registro = await RegistroEvento.create({
        vecino_id: vecino.id,
        evento_id: parsedEventoId,
        notas
      });

      res.status(201).json({
        registro,
        vecino,
        evento
      });
    } catch (error) {
      // Manejar error de clave foránea
      if (error.code === 'ER_NO_REFERENCED_ROW_2' || (error.message && error.message.includes('foreign key constraint fails'))) {
        // En caso de error, intentar obtener los IDs del vecino encontrado para el log (aunque 'vecino' puede no estar accesible aquí si falló antes, pero en este catch sí debería estar si falló el create)
        // Pero 'vecino' está en el scope del try.
        // No podemos acceder a 'vecino' aqui directamente si se define en try con const. 
        // Ah, 'vecino' está en el scope del try block. El catch block es hermano.
        // Necesitamos mover la declaración de vecino fuera del try o simplemente loguear lo que tenemos en request.
        
        console.error(`Error FK detallado: documento=${req.body.documento}, evento_id=${req.body.evento_id}`);
        return res.status(400).json({ 
          error: `No se pudo crear el registro: Fallo de integridad referencial. Verifique logs del servidor para detalles.` 
        });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = RegistroController;
