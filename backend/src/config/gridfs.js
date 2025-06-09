// src/config/gridfs.js

// Importa o mongoose para aceder à ligação activa da base de dados
const mongoose = require('mongoose');
// Importa a biblioteca gridfs-stream, que permite gerir ficheiros em MongoDB
const Grid = require('gridfs-stream');

// Variável privada onde será guardada a instância do GridFS
let gfs;

/**
 * ⚙️ Função de configuração do GridFS
 * Esta função inicia o sistema GridFS com base numa ligação MongoDB previamente estabelecida.
 * O GridFS permite armazenar ficheiros de grandes dimensões (ex.: PDF, imagens, áudio) directamente na base de dados,
 * distribuindo-os em blocos (chunks).
 * 
 * @param {mongoose.Connection} conn - Ligação activa ao MongoDB, proveniente do mongoose.connection
 */
const connectGridFS = (db) => {
    // Verifica se já existe uma instância do GridFS
  Grid.mongo = mongoose.mongo;
  // Se já existir, não faz nada
  gfs = Grid(db); // ← já é o db diretamente
  gfs.collection('uploads');// Define a colecção onde os ficheiros serão armazenados
  console.log('📂 GridFS iniciado (colecção "uploads")');
};


/**
 * 📤 Função para obter a instância do GridFS já inicializada
 * Esta função é útil quando se necessita de aceder ao GridFS noutros módulos (ex.: controllers de upload/download).
 * 
 * @returns {Grid} A instância activa do GridFS
 */
const getGFS = () => gfs;

// Exporta ambas as funções para serem utilizadas noutros ficheiros
module.exports = {
  connectGridFS,
  getGFS
};
