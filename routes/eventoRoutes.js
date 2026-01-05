const express = require('express');
const router = express.Router();
const EventoController = require('../controllers/EventoController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas de lectura (todos los usuarios autenticados pueden ver)
router.get('/', authMiddleware, EventoController.getAll);
router.get('/activos', authMiddleware, EventoController.getActive);
router.get('/:id', authMiddleware, EventoController.getById);
router.get('/:id/vecinos', authMiddleware, EventoController.getVecinos);

// Rutas de modificación (solo admins)
router.post('/', authMiddleware, EventoController.create);
router.put('/:id', authMiddleware, EventoController.update);
router.delete('/:id', authMiddleware, EventoController.delete);
router.patch('/:id/toggle-activo', authMiddleware, EventoController.toggleActivo);

module.exports = router;

