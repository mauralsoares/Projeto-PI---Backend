// backend/src/routes/fileSearchRoute.js
const express = require('express');
const router = express.Router();
const autenticar = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Funções de filtro para os files
function filterByCurso(query, curso) {
  if (curso) query.curso = curso;
}
function filterByUc(query, uc) {
  if (uc) query.uc = uc;
}
function filterByTipo(query, tipo) {
  if (tipo) query.tipo = tipo;
}
function filterByRating(query, minRating, maxRating) {
  if (minRating) query.rating = { ...query.rating, $gte: Number(minRating) };
  if (maxRating) query.rating = { ...query.rating, $lte: Number(maxRating) };
}
function filterByRatingCount(query, minRatingCount, maxRatingCount) {
  if (minRatingCount) query.ratingCount = { ...query.ratingCount, $gte: Number(minRatingCount) };
  if (maxRatingCount) query.ratingCount = { ...query.ratingCount, $lte: Number(maxRatingCount) };
}
function filterByEmail(query, email) {
  if (email) query.ownerEmail = email;
}
function filterByTitulo(query, titulo) {
  if (titulo) query.titulo = { $regex: titulo, $options: 'i' };
}
function filterByDescricao(query, descricao) {
  if (descricao) query.descricao = { $regex: descricao, $options: 'i' };
}
function filterByAno(query, ano) {
  if (ano) query.ano = ano;
}
function filterByDate(query, startDate, endDate) {
  if (startDate || endDate) {
    query.uploadedAt = {};
    if (startDate) query.uploadedAt.$gte = new Date(startDate);
    if (endDate) query.uploadedAt.$lte = new Date(endDate);
  }
}

// Junta todos os filtros
function buildQuery(params) {
  const {
    curso, uc, tipo, minRating, maxRating, minRatingCount, maxRatingCount,
    email, titulo, ano, startDate, endDate,descricao
  } = params;

  const query = {};
  filterByCurso(query, curso);
  filterByUc(query, uc);
  filterByTipo(query, tipo);
  filterByRating(query, minRating, maxRating);
  filterByRatingCount(query, minRatingCount, maxRatingCount);
  filterByEmail(query, email);
  filterByTitulo(query, titulo);
  filterByDescricao(query, descricao);
  filterByAno(query, ano);
  filterByDate(query, startDate, endDate);
  return query;
}

// Função para construir a ordenação
function buildSort(sortBy) {
  if (sortBy === 'oldest') return { uploadedAt: 1 };
  if (sortBy === 'rating') return { rating: -1 };
  if (sortBy === 'ratingCount') return { ratingCount: -1 };
  return { uploadedAt: -1 }; // default: mais recente
}

// Função para formatar cada ficheiro
function formatFile(f) {
  return {
    id: f.fileId,
    titulo: f.titulo,
    curso: f.curso,
    uc: f.uc,
    tipo: f.tipo,
    rating: f.rating,
    ratingCount: f.ratingCount,
    author: f.ownerEmail,
    ano: f.ano,
    uploadedAt: f.uploadedAt,
    descricao: f.descricao,
  };
}

// Rota principal de pesquisa
router.get('/', autenticar(), async (req, res) => {
  const { sortBy = 'recent', page = 1, limit = 8, ...params } = req.query;
  const query = buildQuery(params);
  const sort = buildSort(sortBy);
  const filesCollection = mongoose.connection.db.collection('filemetas');
  const skip = (page - 1) * limit;

  const total = await filesCollection.countDocuments(query);
  const files = await filesCollection
    .find(query)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .toArray();

  res.json({
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    totalFiles: total,
    files: files.map(formatFile)
  });
});

module.exports = router;
