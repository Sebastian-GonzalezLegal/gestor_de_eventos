const Vecino = require('../models/Vecino');
const RegistroEvento = require('../models/RegistroEvento');

class VecinoController {
  static async getAll(req, res) {
    try {
      const vecinos = await Vecino.findAll();
      res.json(vecinos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const vecino = await Vecino.findById(id);

      if (!vecino) {
        return res.status(404).json({ error: 'Vecino no encontrado' });
      }

      // Obtener eventos del vecino
      const eventos = await Vecino.getEventosByVecino(id);
      vecino.eventos = eventos;

      res.json(vecino);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async search(req, res) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ error: 'Parámetro de búsqueda requerido' });
      }

      const vecinos = await Vecino.search(q);
      res.json(vecinos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByDocumento(req, res) {
    try {
      const { documento } = req.params;
      const vecino = await Vecino.findByDocumento(documento);

      if (!vecino) {
        return res.status(404).json({ error: 'Vecino no encontrado' });
      }

      // Obtener eventos del vecino
      const eventos = await Vecino.getEventosByVecino(vecino.id);
      vecino.eventos = eventos;

      res.json(vecino);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      // Solo admins pueden crear vecinos
      if (req.user.rol !== 'admin') {
        return res.status(403).json({
          error: 'Solo los administradores pueden crear vecinos'
        });
      }

      const { nombre, apellido, email, telefono, documento } = req.body;

      if (!nombre || !apellido || !documento) {
        return res.status(400).json({ error: 'Nombre, apellido y documento son requeridos' });
      }

      // Verificar si ya existe el documento
      const existing = await Vecino.findByDocumento(documento);
      if (existing) {
        return res.status(400).json({ error: 'Ya existe un vecino con este documento' });
      }

      const vecino = await Vecino.create({ nombre, apellido, email, telefono, documento });
      res.status(201).json(vecino);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      // Solo admins pueden actualizar vecinos
      if (req.user.rol !== 'admin') {
        return res.status(403).json({
          error: 'Solo los administradores pueden actualizar vecinos'
        });
      }

      const { id } = req.params;
      const { nombre, apellido, email, telefono, documento } = req.body;

      if (!nombre || !apellido || !documento) {
        return res.status(400).json({ error: 'Nombre, apellido y documento son requeridos' });
      }

      const vecino = await Vecino.findById(id);
      if (!vecino) {
        return res.status(404).json({ error: 'Vecino no encontrado' });
      }

      // Verificar si el documento ya existe en otro vecino
      if (documento !== vecino.documento) {
        const existing = await Vecino.findByDocumento(documento);
        if (existing) {
          return res.status(400).json({ error: 'Ya existe otro vecino con este documento' });
        }
      }

      const updated = await Vecino.update(id, { nombre, apellido, email, telefono, documento });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      // Solo admins pueden eliminar vecinos
      if (req.user.rol !== 'admin') {
        return res.status(403).json({
          error: 'Solo los administradores pueden eliminar vecinos'
        });
      }

      const { id } = req.params;
      const vecino = await Vecino.findById(id);

      if (!vecino) {
        return res.status(404).json({ error: 'Vecino no encontrado' });
      }

      await Vecino.delete(id);
      res.json({ message: 'Vecino eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async toggleActivo(req, res) {
    try {
      // Solo admins pueden cambiar el estado de vecinos
      if (req.user.rol !== 'admin') {
        return res.status(403).json({
          error: 'Solo los administradores pueden cambiar el estado de vecinos'
        });
      }

      const { id } = req.params;
      const vecino = await Vecino.toggleActivo(id);

      if (!vecino) {
        return res.status(404).json({ error: 'Vecino no encontrado' });
      }

      res.json(vecino);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getEventos(req, res) {
    try {
      const { id } = req.params;
      const eventos = await Vecino.getEventosByVecino(id);
      res.json(eventos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = VecinoController;