const express = require('express');
const router = express.Router();
const studySpotController = require('../controllers/studySpotController');
const autenticar = require('../middleware/authMiddleware');

// pesquisar
router.get('/pesquisar', studySpotController.search);

// Criar novo local de estudo
router.post('/', autenticar(), studySpotController.create);

// Listar locais do próprio usuário
router.get('/meuslocais', autenticar(), studySpotController.getMine);

// Listar todos os locais de estudo
router.get('/', studySpotController.listAll);

// Listar locais de estudo dentro de um raio (em metros)
router.get('/raio', studySpotController.getByRaio);

// Apagar local de estudo
router.delete('/:id', autenticar(), studySpotController.delete);

module.exports = router;
