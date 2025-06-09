//backend\src\routes\authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');// importar o middleware de autenticação


// Rota de registro
router.post('/register', authController.register);

// Rota de login
router.post('/login', authController.login);

// Rota protegida para ver o perfil 
router.get('/me', authMiddleware, authController.getProfile);

// Rota de logout 
router.post('/logout', authMiddleware(), authController.logout);

// Rota para mudar password
router.post('/change-password', authMiddleware, authController.changePassword);




module.exports = router;