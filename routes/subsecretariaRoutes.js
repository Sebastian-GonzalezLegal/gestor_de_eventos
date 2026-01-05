const express = require('express');
const router = express.Router();
const SubsecretariaController = require('../controllers/SubsecretariaController');
const authMiddleware = require('../middleware/auth');

// Rutas de lectura disponibles para todos los usuarios autenticados (incluyendo visitantes)
router.get('/', authMiddleware, SubsecretariaController.getAll);
router.get('/:id', authMiddleware, SubsecretariaController.getById);

// Rutas de modificación solo para admins
router.post('/', authMiddleware, SubsecretariaController.create);
router.put('/:id', authMiddleware, SubsecretariaController.update);
router.delete('/:id', authMiddleware, SubsecretariaController.delete);

module.exports = router;