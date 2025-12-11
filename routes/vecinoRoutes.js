const express = require('express');
const router = express.Router();
const VecinoController = require('../controllers/VecinoController');

router.get('/', VecinoController.getAll);
router.get('/search', VecinoController.search);
router.get('/por-documento/:documento', VecinoController.getByDocumento);
router.get('/:id', VecinoController.getById);
router.get('/:id/eventos', VecinoController.getEventos);
router.post('/', VecinoController.create);
router.put('/:id', VecinoController.update);
router.delete('/:id', VecinoController.delete);
router.patch('/:id/toggle-activo', VecinoController.toggleActivo);

module.exports = router;