// backend/src/routes/fileRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const autenticar = require('../middleware/authMiddleware');
const fileMeta = require('../models/fileMeta.js');

// 🧠 Configurar GridFS para upload (‼️METADADOS IMUTÁVEIS)
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI_LOCAL,
  file: (req, file) => ({
    filename: file.originalname,
    bucketName: 'uploads',
    metadata: {
      ownerEmail: req.user.email,
      contentType: file.mimetype,
      uploadedAt: new Date()
    }
  })
});

const upload = multer({ storage });

/** 📤 Upload
 * POST /api/uploads
 */
router.post('/', autenticar(), upload.single('ficheiro'), async (req, res) => {
  try {
    //📖 Cria o documento fileMeta com dados do file editáveis
    await fileMeta.create({
      fileId: req.file.id,
      ownerEmail: req.user.email,
      ownerName: req.user.name,
      titulo: req.body.titulo || req.file.originalname,
      descricao: req.body.descricao || '',
      curso: req.body.curso, // Tem de vir igual ao da lista cursosComTipo
      uc: req.body.uc,
      tipo: req.body.tipo,   // Tem de vir igual ao da lista fileTypes
      rating: 0,
      ratingCount: 0,
      uploadedAt: new Date()
    });
    res.json({
      mensagem: 'Ficheiro carregado com sucesso!',
      ficheiro: req.file
    });
  } catch (err) {
    res.status(400).json({ erro: 'Dados inválidos ou curso/tipo não permitido', detalhe: err.message });
  }
});

/** 📥 Download
 * GET /api/uploads/:id 
 */
router.get('/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    const filesCollection = mongoose.connection.db.collection('uploads.files');
    const file = await filesCollection.findOne({ _id: fileId });

    if (!file) return res.status(404).json({ erro: 'Ficheiro não encontrado' });

    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', `attachment; filename="${file.filename}"`);

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);

  } catch (err) {
    console.error('❌ Erro ao carregar ficheiro:', err.message);
    res.status(500).json({ erro: 'Erro ao carregar ficheiro' });
  }
});

// 📄 Visualizar ficheiro inline (imagem, PDF, etc.)
router.get('/view/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    const filesCollection = mongoose.connection.db.collection('uploads.files');
    const file = await filesCollection.findOne({ _id: fileId });
    if (!file) return res.status(404).json({ erro: 'Ficheiro não encontrado' });

    // 📖 Browser tentará abrir inline (PDF, imagem, etc.)
    res.set('Content-Type', file.contentType);

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads',
    });

    const readStream = bucket.openDownloadStream(fileId);
    readStream.pipe(res);
  } catch (err) {
    console.error('❌ Erro ao visualizar ficheiro:', err.message);
    res.status(500).json({ erro: 'Erro ao visualizar ficheiro' });
  }
});


// Apagar vários ficheiros (owner ou admin)
// DELETE /api/uploads  --> array de IDs no body
router.delete('/delete', autenticar(), async (req, res) => {
  try {
    const { ids } = req.body; // array de IDs
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ erro: 'IDs em falta' });
    }

    let apagados = 0, falhados = 0, erros = [];

    for (const id of ids) {
      try {
        const fileId = new mongoose.Types.ObjectId(id);
        const meta = await fileMeta.findOne({ fileId });
        if (!meta) { falhados++; erros.push({ id, erro: 'Meta não encontrado' }); continue; }

        // Só owner ou admin pode apagar
        if (meta.ownerEmail !== req.user.email && req.user.tipo !== 'admin') {
          falhados++; erros.push({ id, erro: 'Não autorizado' }); continue;
        }

        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
        await bucket.delete(fileId); // Apaga documento  do chunks e do files
        await fileMeta.deleteOne({ fileId });//Apaga o documento fileMeta
        apagados++;
      } catch (err) {
        falhados++; erros.push({ id, erro: err.message });
      }
    }

    res.json({ mensagem: `Apagados: ${apagados}, Falhados: ${falhados}`, erros });
  } catch (err) {
    res.status(500).json({ erro: '❌Erro ao apagar ficheiros', detalhe: err.message });
  }
});

module.exports = router;
