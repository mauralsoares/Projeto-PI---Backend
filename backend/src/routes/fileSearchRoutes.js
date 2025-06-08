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
    page = 1,
    limit = 8
  } = req.query;

  const query = {};
  if (curso) query['metadata.curso'] = curso;
  if (uc) query['metadata.uc'] = uc;
  if (tipo) query['metadata.tipo'] = tipo;
  if (minRating) query['metadata.rating'] = { $gte: Number(minRating) };

  const filesCollection = mongoose.connection.db.collection('uploads.files');

  const skip = (page - 1) * limit;

  const total = await filesCollection.countDocuments(query);
  const files = await filesCollection
    .find(query)
    .sort({ uploadDate: -1 })
    .skip(skip)
    .limit(Number(limit))
    .toArray();

  const formatted = files.map(f => ({
    id: f._id,
    filename: f.filename,
    title: f.metadata?.titulo,
    curso: f.metadata?.curso,
    uc: f.metadata?.uc,
    tipo: f.metadata?.tipo,
    rating: f.metadata?.rating || null,
    ratingCount: f.metadata?.ratingCount || 0,
    author: f.metadata?.ownerName || '',
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
