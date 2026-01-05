const express = require('express');
const router = express.Router();
const VecinoController = require('../controllers/VecinoController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas de lectura (todos los usuarios autenticados pueden ver)
router.get('/', authMiddleware, VecinoController.getAll);
router.get('/search', authMiddleware, VecinoController.search);
router.get('/por-documento/:documento', authMiddleware, VecinoController.getByDocumento);
router.get('/:id', authMiddleware, VecinoController.getById);
router.get('/:id/eventos', authMiddleware, VecinoController.getEventos);

// Rutas de modificación (solo admins)
router.post('/', authMiddleware, VecinoController.create);
router.put('/:id', authMiddleware, VecinoController.update);
router.delete('/:id', authMiddleware, VecinoController.delete);
router.patch('/:id/toggle-activo', authMiddleware, VecinoController.toggleActivo);

module.exports = router;