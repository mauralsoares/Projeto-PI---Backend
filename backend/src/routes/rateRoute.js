const express = require('express');
const router = express.Router();
const autenticar = require('../middleware/authMiddleware');
const ratingController = require('../controllers/ratingController');

router.post('/:id/classificar', autenticar(), ratingController.classificar);

module.exports = router;