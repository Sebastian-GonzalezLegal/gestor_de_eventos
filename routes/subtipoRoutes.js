const express = require('express');
const router = express.Router();
const SubtipoController = require('../controllers/SubtipoController');
const authMiddleware = require('../middleware/auth');

// Rutas de lectura disponibles para todos los usuarios autenticados (incluyendo visitantes)
router.get('/', authMiddleware, SubtipoController.getAll);
router.get('/:id', authMiddleware, SubtipoController.getById);
router.get('/tipo/:tipoId', authMiddleware, SubtipoController.getByTipo);

// Rutas de modificación solo para admins
router.post('/', authMiddleware, SubtipoController.create);
router.put('/:id', authMiddleware, SubtipoController.update);
router.delete('/:id', authMiddleware, SubtipoController.delete);

module.exports = router;