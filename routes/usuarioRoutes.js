const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');

router.get('/', UsuarioController.getAll);
router.get('/search', UsuarioController.search);
router.get('/por-documento/:documento', UsuarioController.getByDocumento);
router.get('/:id', UsuarioController.getById);
router.get('/:id/eventos', UsuarioController.getEventos);
router.post('/', UsuarioController.create);
router.put('/:id', UsuarioController.update);
router.delete('/:id', UsuarioController.delete);
router.patch('/:id/toggle-activo', UsuarioController.toggleActivo);

module.exports = router;

