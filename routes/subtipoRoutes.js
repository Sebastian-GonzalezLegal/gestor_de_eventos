const express = require('express');
const router = express.Router();
const SubtipoController = require('../controllers/SubtipoController');

router.get('/', SubtipoController.getAll);
router.get('/:id', SubtipoController.getById);
router.get('/tipo/:tipoId', SubtipoController.getByTipo);
router.post('/', SubtipoController.create);
router.put('/:id', SubtipoController.update);
router.delete('/:id', SubtipoController.delete);

module.exports = router;