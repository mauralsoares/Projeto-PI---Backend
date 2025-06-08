// backend\src\routes\fileRateRoute.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const autenticar = require('../middleware/authMiddleware');




// POST /api/uploads/:id/classificar
router.post('/:id/classificar', autenticar(), async (req, res) => {
  const nota = Number(req.body.nota);
  if (isNaN(nota) || nota < 0 || nota > 5) {
    return res.status(400).json({ erro: 'Nota inválida (0 a 5)' });
  }

  const fileId = new mongoose.Types.ObjectId(req.params.id);
  const user = await User.findById(req.user.id);

  // Verifica se já classificou este ficheiro
  if (user.classificacoes.some(c => c.fileId.equals(fileId))) {
    return res.status(400).json({ erro: 'Já classificou este ficheiro' });
  }

  // Vai buscar o ficheiro e verifica se é o owner
  const filesCollection = mongoose.connection.db.collection('uploads.files');
  const file = await filesCollection.findOne({ _id: fileId });
  if (!file) return res.status(404).json({ erro: 'Ficheiro não encontrado' });

  if (file.metadata.ownerEmail === user.email) {
    return res.status(403).json({ erro: 'Não pode classificar o seu próprio ficheiro' });
  }

  // Adiciona classificação ao user
  user.classificacoes.push({ fileId, nota });
  await user.save();

  // Atualiza rating do ficheiro
  const novasNotas = await User.aggregate([
    { $unwind: '$classificacoes' },
    { $match: { 'classificacoes.fileId': fileId } },
    { $group: { _id: null, media: { $avg: '$classificacoes.nota' }, count: { $sum: 1 } } }
  ]);
  const media = novasNotas[0]?.media || nota;
  const count = novasNotas[0]?.count || 1;

  await filesCollection.updateOne(
    { _id: fileId },
    { $set: { 'metadata.rating': media, 'metadata.ratingCount': count } }
  );

  res.json({ mensagem: 'Classificação registada', media, count });
});