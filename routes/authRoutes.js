const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas
router.post('/login', AuthController.login);

// Rutas protegidas (requieren autenticación)
router.post('/register', authMiddleware, AuthController.register);
router.get('/verify', authMiddleware, AuthController.verify);

// Rutas solo para administradores
router.get('/users', authMiddleware, AuthController.getAll);
router.put('/users/:id', authMiddleware, AuthController.update);
router.delete('/users/:id', authMiddleware, AuthController.delete);
router.patch('/users/:id/toggle-activo', authMiddleware, AuthController.toggleActivo);

module.exports = router;
