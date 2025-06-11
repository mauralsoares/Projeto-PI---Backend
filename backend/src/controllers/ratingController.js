const mongoose = require('mongoose');
const User = require('../models/User');
const FileMeta = require('../models/fileMeta');

// POST /api/uploads/:id/classificar
exports.classificar = async (req, res) => {
  const nota = Number(req.body.nota);
  if (isNaN(nota) || nota < 0 || nota > 5) {
    return res.status(400).json({ erro: 'Nota inválida (0 a 5)' });
  }

  const fileId = new mongoose.Types.ObjectId(req.params.id);
  const user = await User.findById(req.user.id);

  // 1. Vai buscar o fileMeta
  const fileMeta = await FileMeta.findOne({ fileId });
  if (!fileMeta) {
    return res.status(404).json({ erro: 'Ficheiro não encontrado' });
  }

  // 2. Impede o owner de classificar o próprio ficheiro
  if (fileMeta.ownerEmail === user.email) {
    return res.status(403).json({ erro: 'Não pode classificar o seu próprio ficheiro' });
  }

  // 3. Verifica se já classificou este ficheiro
  user.rates = user.rates || [];
  const rateIndex = user.rates.findIndex(c => c.fileId.toString() === fileId.toString());
  let antigo = null;
  let mensagem = '';

  if (rateIndex !== -1) {
    // Já classificou: atualizar nota
    antigo = user.rates[rateIndex].nota;
    user.rates[rateIndex].nota = nota;
    if (fileMeta.ratingCount > 0) {
      fileMeta.rating = ((fileMeta.rating * fileMeta.ratingCount) - antigo + nota) / fileMeta.ratingCount;
    }
    mensagem = 'Classificação atualizada com sucesso';
  } else {
    // Nova classificação
    user.rates.push({ fileId, nota });
    fileMeta.rating = ((fileMeta.rating * fileMeta.ratingCount) + nota) / (fileMeta.ratingCount + 1);
    fileMeta.ratingCount += 1;
    mensagem = 'Classificação registada com sucesso';
  }

  await user.save();
  await fileMeta.save();

  res.json({
    mensagem,
    rating: fileMeta.rating,
    ratingCount: fileMeta.ratingCount
  });
};

// DELETE /api/uploads/:id/classificar
exports.removerClassificacao = async (req, res) => {
  const fileId = new mongoose.Types.ObjectId(req.params.id);
  const user = await User.findById(req.user.id);
  const fileMeta = await FileMeta.findOne({ fileId });
  if (!fileMeta) return res.status(404).json({ erro: 'Ficheiro não encontrado' });

  const isAdmin = user.role && user.role === 'admin';
  user.rates = user.rates || [];
  const rateIndex = user.rates.findIndex(c => c.fileId.toString() === fileId.toString());
  if (rateIndex === -1 && !isAdmin) {
    return res.status(404).json({ erro: 'Não existe classificação deste utilizador para este ficheiro' });
  }

  let notaRemovida = null;
  if (rateIndex !== -1) {
    notaRemovida = user.rates[rateIndex].nota;
    user.rates.splice(rateIndex, 1);
  } else if (isAdmin) {
    return res.status(501).json({ erro: 'Remoção por admin não implementada neste endpoint.' });
  }

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
};