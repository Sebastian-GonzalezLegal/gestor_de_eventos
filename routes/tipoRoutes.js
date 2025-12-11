const express = require('express');
const router = express.Router();
const TipoController = require('../controllers/TipoController');

router.get('/', TipoController.getAll);
router.get('/:id', TipoController.getById);
router.get('/:id/subtipos', TipoController.getSubtipos);
router.post('/', TipoController.create);
router.put('/:id', TipoController.update);
router.delete('/:id', TipoController.delete);

module.exports = router;