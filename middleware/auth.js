const AuthController = require('../controllers/AuthController');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token de autenticación requerido'
    });
  }

  const token = authHeader.substring(7); // Remover 'Bearer '

  const decoded = AuthController.verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }

  // Agregar información del usuario a la request
  req.user = {
    id: decoded.id,
    email: decoded.email,
    rol: decoded.rol,
    nombre: decoded.nombre
  };

  next();
};

module.exports = authMiddleware;
