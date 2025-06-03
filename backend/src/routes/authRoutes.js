const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');// importar o middleware de autenticação

// Rota de registro
router.post('/register', authController.register);

// Rota de login
router.post('/login', authController.login);

// Rota protegida para ver o perfil (EXEMPLO)
router.get('/me', authMiddleware, authController.getProfile);



module.exports = router;