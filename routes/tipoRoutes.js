const express = require('express');
const router = express.Router();
const TipoController = require('../controllers/TipoController');
const authMiddleware = require('../middleware/auth');

// Rutas de lectura disponibles para todos los usuarios autenticados (incluyendo visitantes)
router.get('/', authMiddleware, TipoController.getAll);
router.get('/:id', authMiddleware, TipoController.getById);
router.get('/:id/subtipos', authMiddleware, TipoController.getSubtipos);

// Rutas de modificación solo para admins
router.post('/', authMiddleware, TipoController.create);
router.put('/:id', authMiddleware, TipoController.update);
router.delete('/:id', authMiddleware, TipoController.delete);

module.exports = router;