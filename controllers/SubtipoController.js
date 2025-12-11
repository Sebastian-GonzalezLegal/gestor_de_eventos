const Subtipo = require('../models/Subtipo');
const Tipo = require('../models/Tipo');

class SubtipoController {
  static async getAll(req, res) {
    try {
      const subtipos = await Subtipo.findAll();
      res.json(subtipos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const subtipo = await Subtipo.findById(id);

      if (!subtipo) {
        return res.status(404).json({ error: 'Subtipo no encontrado' });
      }

      res.json(subtipo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByTipo(req, res) {
    try {
      const { tipoId } = req.params;
      const subtipos = await Subtipo.findByTipo(tipoId);
      res.json(subtipos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { nombre, tipo_id } = req.body;

      if (!nombre || !tipo_id) {
        return res.status(400).json({ error: 'El nombre y tipo_id son requeridos' });
      }

      // Verificar que el tipo existe
      const tipo = await Tipo.findById(tipo_id);
      if (!tipo) {
        return res.status(400).json({ error: 'El tipo especificado no existe' });
      }

      const subtipo = await Subtipo.create({ nombre, tipo_id });
      res.status(201).json(subtipo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, tipo_id } = req.body;

      if (!nombre || !tipo_id) {
        return res.status(400).json({ error: 'El nombre y tipo_id son requeridos' });
      }

      const subtipo = await Subtipo.findById(id);
      if (!subtipo) {
        return res.status(404).json({ error: 'Subtipo no encontrado' });
      }

      // Verificar que el tipo existe
      const tipo = await Tipo.findById(tipo_id);
      if (!tipo) {
        return res.status(400).json({ error: 'El tipo especificado no existe' });
      }

      const updated = await Subtipo.update(id, { nombre, tipo_id });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const subtipo = await Subtipo.findById(id);

      if (!subtipo) {
        return res.status(404).json({ error: 'Subtipo no encontrado' });
      }

      await Subtipo.delete(id);
      res.json({ message: 'Subtipo eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = SubtipoController;