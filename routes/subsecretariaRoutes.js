const express = require('express');
const router = express.Router();
const SubsecretariaController = require('../controllers/SubsecretariaController');

router.get('/', SubsecretariaController.getAll);
router.get('/:id', SubsecretariaController.getById);
router.post('/', SubsecretariaController.create);
router.put('/:id', SubsecretariaController.update);
router.delete('/:id', SubsecretariaController.delete);

module.exports = router;