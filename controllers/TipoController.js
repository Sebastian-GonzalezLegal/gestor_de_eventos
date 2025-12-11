const Tipo = require('../models/Tipo');

class TipoController {
  static async getAll(req, res) {
    try {
      const tipos = await Tipo.findAll();
      res.json(tipos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const tipo = await Tipo.findById(id);

      if (!tipo) {
        return res.status(404).json({ error: 'Tipo no encontrado' });
      }

      // Obtener subtipos del tipo
      const subtipos = await Tipo.getSubtipos(id);
      tipo.subtipos = subtipos;

      res.json(tipo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { nombre } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      const tipo = await Tipo.create({ nombre });
      res.status(201).json(tipo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      const tipo = await Tipo.findById(id);
      if (!tipo) {
        return res.status(404).json({ error: 'Tipo no encontrado' });
      }

      const updated = await Tipo.update(id, { nombre });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const tipo = await Tipo.findById(id);

      if (!tipo) {
        return res.status(404).json({ error: 'Tipo no encontrado' });
      }

      await Tipo.delete(id);
      res.json({ message: 'Tipo eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getSubtipos(req, res) {
    try {
      const { id } = req.params;
      const subtipos = await Tipo.getSubtipos(id);
      res.json(subtipos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TipoController;