// backend\src\routes\fileRateRoute.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const autenticar = require('../middleware/authMiddleware');
const User = require('../models/User');
const FileMeta = require('../models/fileMeta');

// POST /api/uploads/:id/classificar
// Permite ao utilizador classificar ou atualizar a classificação de um ficheiro
router.post('/:id/classificar', autenticar(), async (req, res) => {
  const nota = Number(req.body.nota);
  if (isNaN(nota) || nota < 0 || nota > 5) {
    return res.status(400).json({ erro: 'Nota inválida (0 a 5)' });
  }

  const fileId = new mongoose.Types.ObjectId(req.params.id);
  const user = await User.findById(req.user.id);
  const fileMeta = await FileMeta.findOne({ fileId });
  if (!fileMeta) return res.status(404).json({ erro: 'Ficheiro não encontrado' });

  // Impede o owner de classificar o próprio ficheiro
  if (fileMeta.ownerEmail === user.email) {
    return res.status(403).json({ erro: 'Não pode classificar o seu próprio ficheiro' });
  }

  // Garante que o array existe
  user.classificacoes = user.classificacoes || [];
  // Procura se já existe classificação deste user para este ficheiro
  const rateIndex = user.classificacoes.findIndex(c => c.fileId.equals(fileId));
  let antigo = null;

  if (rateIndex !== -1) {
    // Atualizar classificação existente
    antigo = user.classificacoes[rateIndex].nota;
    user.classificacoes[rateIndex].nota = nota;
    // Atualiza média incrementalmente
    if (fileMeta.ratingCount > 0) {
      fileMeta.rating = ((fileMeta.rating * fileMeta.ratingCount) - antigo + nota) / fileMeta.ratingCount;
    }
  } else {
    // Nova classificação
    user.classificacoes.push({ fileId, nota });
    fileMeta.rating = ((fileMeta.rating * fileMeta.ratingCount) + nota) / (fileMeta.ratingCount + 1);
    fileMeta.ratingCount += 1;
  }

  await user.save();
  await fileMeta.save();

  res.json({
    mensagem: 'Classificação registada/atualizada com sucesso',
    rating: fileMeta.rating,
    ratingCount: fileMeta.ratingCount
  });
});

// DELETE /api/uploads/:id/classificar
// Permite ao utilizador (ou admin) remover a sua classificação de um ficheiro
router.delete('/:id/classificar', autenticar(), async (req, res) => {
  const fileId = new mongoose.Types.ObjectId(req.params.id);
  const user = await User.findById(req.user.id);
  const fileMeta = await FileMeta.findOne({ fileId });
  if (!fileMeta) return res.status(404).json({ erro: 'Ficheiro não encontrado' });

  // Só o próprio utilizador ou admin pode remover a classificação
  const isAdmin = user.role && user.role === 'admin';
  const rateIndex = user.classificacoes.findIndex(c => c.fileId.equals(fileId));
  if (rateIndex === -1 && !isAdmin) {
    return res.status(403).json({ erro: 'Não tem permissão para remover esta classificação' });
  }

  // Se não for admin, só pode remover a sua própria classificação
  let notaRemovida = null;
  if (rateIndex !== -1) {
    notaRemovida = user.classificacoes[rateIndex].nota;
    user.classificacoes.splice(rateIndex, 1);
  } else if (isAdmin) {
    // Admin pode remover qualquer classificação de qualquer user
    // (Por implementar: implementar lógica para admins removerem classificações de outros users) - OPCIONAL
    return res.status(501).json({ erro: 'Remoção por admin não implementada neste endpoint.' });
  }

  // Atualizar rating e ratingCount de forma incremental
  if (notaRemovida !== null && fileMeta.ratingCount > 1) {
    fileMeta.rating = ((fileMeta.rating * fileMeta.ratingCount) - notaRemovida) / (fileMeta.ratingCount - 1);
    fileMeta.ratingCount -= 1;
  } else if (notaRemovida !== null && fileMeta.ratingCount === 1) {
    fileMeta.rating = 0;
    fileMeta.ratingCount = 0;
  }

  await user.save();
  await fileMeta.save();

  res.json({
    mensagem: 'Classificação removida com sucesso',
    rating: fileMeta.rating,
    ratingCount: fileMeta.ratingCount
  });
});

module.exports = router;