const express = require('express');
const router = express.Router();

const { ucsUnicas } = require('../models/lists/ucs');
const { cursosComTipo } = require('../models/lists/cursos');
const fileTypes = require('../models/lists/fileTypes');

// Rota para obter todas as UCs
router.get('/ucs', (req, res) => {
  res.json(ucsUnicas);
});

// Rota para obter todos os cursos
router.get('/cursos', (req, res) => {
  res.json(cursosComTipo);
});

// Rota para obter todos os tipos de ficheiro
router.get('/filetypes', (req, res) => {
  res.json(fileTypes);
});

module.exports = router;