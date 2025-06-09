// backend/src/routes/fileSearchRoute.js
const express = require('express');
const router = express.Router();
const autenticar = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

router.get('/', autenticar(), async (req, res) => {
  const {
    curso,
    uc,
    tipo,
    minRating,
    maxRating,
    minRatingCount,
    maxRatingCount,
    email,
    titulo,
    ano,
    startDate,
    endDate,
    sortBy = 'recent', // 'recent', 'oldest', 'rating', 'ratingCount'
    page = 1,
    limit = 8
  } = req.query;

  const query = {};

  if (curso) query['metadata.curso'] = curso;
  if (uc) query['metadata.uc'] = uc;
  if (tipo) query['metadata.tipo'] = tipo;
  if (minRating) query['metadata.rating'] = { ...query['metadata.rating'], $gte: Number(minRating) };
  if (maxRating) query['metadata.rating'] = { ...query['metadata.rating'], $lte: Number(maxRating) };
  if (minRatingCount) query['metadata.ratingCount'] = { ...query['metadata.ratingCount'], $gte: Number(minRatingCount) };
  if (maxRatingCount) query['metadata.ratingCount'] = { ...query['metadata.ratingCount'], $lte: Number(maxRatingCount) };
  if (email) query['metadata.ownerEmail'] = email;
  if (titulo) query['metadata.titulo'] = { $regex: titulo, $options: 'i' };
  if (ano) query['metadata.ano'] = ano;

  // Data de upload entre datas
  if (startDate || endDate) {
    query.uploadDate = {};
    if (startDate) query.uploadDate.$gte = new Date(startDate);
    if (endDate) query.uploadDate.$lte = new Date(endDate);
  }

  // Ordenação dinâmica
  let sort = { uploadDate: -1 }; // default: mais recente
  if (sortBy === 'oldest') sort = { uploadDate: 1 };
  if (sortBy === 'rating') sort = { 'metadata.rating': -1 };
  if (sortBy === 'ratingCount') sort = { 'metadata.ratingCount': -1 };

  const filesCollection = mongoose.connection.db.collection('fileMeta');
  const skip = (page - 1) * limit;

  const total = await filesCollection.countDocuments(query);
  const files = await filesCollection
    .find(query)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .toArray();

  const formatted = files.map(f => ({
    id: f._id,
    filename: f.filename,
    titulo: f.metadata?.titulo,
    curso: f.metadata?.curso,
    uc: f.metadata?.uc,
    tipo: f.metadata?.tipo,
    rating: f.metadata?.rating || null,
    ratingCount: f.metadata?.ratingCount || 0,
    author: f.metadata?.ownerName || '',
    email: f.metadata?.ownerEmail || '',
    ano: f.metadata?.ano || '',
    uploadDate: f.uploadDate
  }));

  res.json({
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    totalFiles: total,
    files: formatted
  });
});

module.exports = router;
