const express = require('express');
const router = express.Router();
const RegistroController = require('../controllers/RegistroController');

router.get('/', RegistroController.getAll);
router.get('/:id', RegistroController.getById);
router.post('/', RegistroController.create);
router.post('/por-documento', RegistroController.registerByDocumento);
router.delete('/:id', RegistroController.delete);

module.exports = router;

