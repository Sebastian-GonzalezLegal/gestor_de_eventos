const express = require('express');
const router = express.Router();
const RegistroController = require('../controllers/RegistroController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas de lectura (todos los usuarios autenticados pueden ver)
router.get('/', authMiddleware, RegistroController.getAll);
router.get('/:id', authMiddleware, RegistroController.getById);

// Rutas de modificación (solo admins)
router.post('/', authMiddleware, RegistroController.create);
router.post('/por-documento', authMiddleware, RegistroController.registerByDocumento);
router.delete('/:id', authMiddleware, RegistroController.delete);

module.exports = router;

