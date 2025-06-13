const express = require('express');
const router = express.Router();
const StudySpot = require('../models/studyspot');

// Criar local de estudo (com verificação de proximidade)
exports.create = async (req, res) => {
  try {
    const { nome, descricao, longitude, latitude, cidade, morada, codigoPostal, forcar } = req.body;
    const threshold = 30; // metros

    const locaisProximos = await StudySpot.find({
      localizacao: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: threshold
        }
      }
    });

    if (locaisProximos.length > 0 && !forcar) {
      return res.status(409).json({
        erro: 'Já existe um local de estudo muito próximo!',
        locaisProximos,
        podeForcar: true,
        mensagem: 'Já existe um local semelhante. Confirma se queres mesmo adicionar este local.'
      });
    }

    const spot = await StudySpot.create({
      nome,
      descricao,
      localizacao: { type: 'Point', coordinates: [longitude, latitude] },
      cidade,
      morada,
      codigoPostal,
      criadoPor: req.user.id // <-- IMPORTANTE
    });

    res.status(201).json(spot);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const detalhes = Object.values(err.errors).map(e => ({
        campo: e.path,
        mensagem: e.message
      }));
      return res.status(400).json({
        erro: 'Erro de validação ao criar local',
        detalhes
      });
    }
    res.status(400).json({ erro: 'Erro ao criar local', detalhe: err.message });
  }
};

// Listar todos os locais de estudo
exports.listAll = async (req, res) => {
  const spots = await StudySpot.find();
  res.json(spots);
};

// Listar locais de estudo dentro de um raio (em metros)
exports.getByRaio = async (req, res) => {
  const { longitude, latitude, raio } = req.query;
  if (!longitude || !latitude || !raio) {
    return res.status(400).json({ erro: 'longitude, latitude e raio são obrigatórios' });
  }
  try {
    const spots = await StudySpot.find({
      localizacao: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: parseInt(raio)
        }
      }
    });
    res.json(spots);
  } catch (err) {
    res.status(500).json({ erro: 'Erro na pesquisa geoespacial', detalhe: err.message });
  }
};

// Apagar local de estudo por ID
exports.delete = async (req, res) => {
  try {
    const spot = await StudySpot.findByIdAndDelete(req.params.id);
    if (!spot) {
      return res.status(404).json({ erro: 'Local não encontrado' });
    }
    res.json({ mensagem: 'Local apagado com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao apagar local', detalhe: err.message });
  }
};

// ✅ NOVA FUNÇÃO: Listar locais do usuário autenticado
exports.getMine = async (req, res) => {
  try {
    const userId = req.user.id;
    const locais = await StudySpot.find({ criadoPor: userId });
    res.json(locais);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar seus locais', detalhe: err.message });
  }
};

exports.search = async (req, res) => {
  const { termo } = req.query;

  if (!termo) {
    return res.status(400).json({ erro: 'Parâmetro de pesquisa "termo" é obrigatório.' });
  }

  try {
    const resultado = await StudySpot.find({
      $or: [
        { nome: { $regex: termo, $options: 'i' } },
        { morada: { $regex: termo, $options: 'i' } },
        { cidade: { $regex: termo, $options: 'i' } },
      ]
    });

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao procurar locais', detalhe: err.message });
  }
};

