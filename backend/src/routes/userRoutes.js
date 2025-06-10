const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Rotas de administração de utilizadores (apenas para admin)
 * Todas as rotas abaixo requerem autenticação e permissões de admin.
 */

// Listar todos os utilizadores
// GET /api/users
router.get('/', authMiddleware("admin"), userController.listUsers);

// Ver perfil de um utilizador específico
// GET /api/users/:id
router.get('/:id', authMiddleware("admin"), userController.getUserById);

// Editar dados de um utilizador (ex: nome, tipo, etc.)
// PATCH /api/users/:id
router.patch('/:id', authMiddleware("admin"), userController.updateUser);

// Apagar um utilizador
// DELETE /api/users/:id
router.delete('/:id', authMiddleware("admin"), userController.deleteUser);

// Listar todos os utilizadores (sem paginação)
router.get('/all', authMiddleware("admin"), userController.listAllUsers);

// Procurar utilizador por email
router.get('/email/:email', authMiddleware("admin"), userController.getUserByEmail);

module.exports = router;