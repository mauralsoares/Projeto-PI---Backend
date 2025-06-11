//backend\src\routes\authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers.js');
const authMiddleware = require('../middleware/authMiddleware');// importar o middleware de autenticação


// Rota de registro
router.post('/register', authController.register);

// Rota de login
router.post('/login', authController.login);

// Rota protegida para ver o perfil 
router.get('/me', authMiddleware(), authController.getProfile);

// Editar o próprio perfil (nome apenas)
router.patch('/me', authMiddleware(), authController.updateProfile);

// Rota de logout (nao faz grande coisa mas pode ser implementada umablacklist ou algo assim)
router.post('/logout', authMiddleware(), authController.logout);

// Rota para mudar password (não implementado)
router.post('/change-password', authMiddleware, authController.changePassword);




module.exports = router;