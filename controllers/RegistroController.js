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
      const { vecino_id, evento_id, notas } = req.body;

      if (!vecino_id || !evento_id) {
        return res.status(400).json({ error: 'Vecino y evento son requeridos' });
      }

      // Verificar que el vecino existe
      const vecino = await Vecino.findById(vecino_id);
      if (!vecino) {
        return res.status(404).json({ error: 'Vecino no encontrado' });
      }

      // Verificar que el evento existe
      const evento = await Evento.findById(evento_id);
      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }

      const registro = await RegistroEvento.create({ vecino_id, evento_id, notas });
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

      // Verificar si ya está registrado
      const existing = await RegistroEvento.findByVecinoAndEvento(vecino.id, evento_id);
      if (existing) {
        return res.status(400).json({
          error: 'El vecino ya está registrado en este evento',
          vecino,
          evento
        });
      }

      const registro = await RegistroEvento.create({
        vecino_id: vecino.id,
        evento_id,
        notas
      });

      res.status(201).json({
        registro,
        vecino,
        evento
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = RegistroController;

