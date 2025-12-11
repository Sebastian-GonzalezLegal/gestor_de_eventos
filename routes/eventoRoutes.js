const express = require('express');
const router = express.Router();
const EventoController = require('../controllers/EventoController');

router.get('/', EventoController.getAll);
router.get('/activos', EventoController.getActive);
router.get('/:id', EventoController.getById);
router.get('/:id/vecinos', EventoController.getVecinos);
router.post('/', EventoController.create);
router.put('/:id', EventoController.update);
router.delete('/:id', EventoController.delete);
router.patch('/:id/toggle-activo', EventoController.toggleActivo);

module.exports = router;

