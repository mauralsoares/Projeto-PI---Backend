// backend\src\routes\fileRateRoute.js
const express = require('express');
const router = express.Router();
const autenticar = require('../middleware/authMiddleware');
const ratingController = require('../controllers/ratingController');

router.post('/:id/classificar', autenticar(), ratingController.classificar);
router.delete('/:id/classificar', autenticar(), ratingController.removerClassificacao);

module.exports = router;