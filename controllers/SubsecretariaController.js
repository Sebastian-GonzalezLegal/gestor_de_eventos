const Subsecretaria = require('../models/Subsecretaria');

class SubsecretariaController {
  static async getAll(req, res) {
    try {
      const subsecretarias = await Subsecretaria.findAll();
      res.json(subsecretarias);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const subsecretaria = await Subsecretaria.findById(id);

      if (!subsecretaria) {
        return res.status(404).json({ error: 'Subsecretaría no encontrada' });
      }

      res.json(subsecretaria);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      // Solo admins pueden crear subsecretarías
      if (req.user.rol !== 'admin') {
        return res.status(403).json({
          error: 'Solo los administradores pueden crear subsecretarías'
        });
      }

      const { nombre } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      const subsecretaria = await Subsecretaria.create({ nombre });
      res.status(201).json(subsecretaria);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      // Solo admins pueden actualizar subsecretarías
      if (req.user.rol !== 'admin') {
        return res.status(403).json({
          error: 'Solo los administradores pueden actualizar subsecretarías'
        });
      }

      const { id } = req.params;
      const { nombre } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      const subsecretaria = await Subsecretaria.findById(id);
      if (!subsecretaria) {
        return res.status(404).json({ error: 'Subsecretaría no encontrada' });
      }

      const updated = await Subsecretaria.update(id, { nombre });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      // Solo admins pueden eliminar subsecretarías
      if (req.user.rol !== 'admin') {
        return res.status(403).json({
          error: 'Solo los administradores pueden eliminar subsecretarías'
        });
      }

      const { id } = req.params;
      const subsecretaria = await Subsecretaria.findById(id);

      if (!subsecretaria) {
        return res.status(404).json({ error: 'Subsecretaría no encontrada' });
      }

      await Subsecretaria.delete(id);
      res.json({ message: 'Subsecretaría eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = SubsecretariaController;