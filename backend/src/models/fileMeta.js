const mongoose = require("mongoose");
const cursos = require('./lists/cursos');
const ucs = require('./lists/ucs');
const fileTypes = require('./lists/fileTypes');
const { validate } = require("./User");


const FileMetaSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  }, // ID do ficheiro em GridFS
  ownerEmail: { type: String, required: true, lowercase: true,trim: true, match: [/.+@.+\..+/, 'Email inválido']}, // Email do dono
  curso: { type: String, required: true, trim: true, default: "", enum: cursos.cursosComTipo },
  uc:{type: String, required: true, trim: true, default: "", enum: ucs.ucsUnicas}, 
  titulo:{type: String, required: true, trim: true, default: ""},
  descricao:{type: String,default: "",trim: true},
  tipo: { type: String, required: true, trim: true, default: "",enum: fileTypes }, // Ex: "PDF", "Video", etc.

  rating: { type: Number, default: 0, validate: {validator: (v) => v >= 0 && v <= 5, message: 'Rating deve ser entre 0 e 5'} }, // Média das classificações
  ratingCount: { type: Number, default: 0, min: 0 }, 
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FileMeta", FileMetaSchema);


// | Campo        | Obrigatório | Origem/Formulário | Valores possíveis/validação                | Default                | Observações                                 |
// |--------------|-------------|-------------------|--------------------------------------------|------------------------|---------------------------------------------|
// | ficheiro     | Sim         | form-data         | Qualquer ficheiro                          | —                      | Upload do ficheiro (input type="file")      |
// | curso        | Sim         | form-data         | Um dos `cursos.cursosComTipo`              | ""                     | Usa lista do backend                        |
// | uc           | Sim         | form-data         | Um dos `ucs.ucsUnicas`                     | ""                     | Usa lista do backend                        |
// | tipo         | Sim         | form-data         | Um dos `fileTypes`                         | ""                     | Usa lista do backend                        |
// | titulo       | Sim         | form-data         | Qualquer texto                             | "" (ou nome do ficheiro)| Se vazio, backend usa nome do ficheiro      |
// | descricao    | Não         | form-data         | Qualquer texto                             | ""                     | Opcional                                    |
// | ownerEmail   | Automático  | JWT               | Email do utilizador autenticado            | —                      | Preenchido pelo backend                     |
// | ownerName    | Automático  | JWT               | Nome do utilizador autenticado             | —                      | Preenchido pelo backend                     |
// | rating       | Não         | backend           | Número entre 0 e 5                         | 0                      | Não enviar do frontend                      |
// | ratingCount  | Não         | backend           | Número >= 0                                | 0                      | Não enviar do frontend                      |
// | uploadedAt   | Não         | backend           | Data                                       | Data atual             | Não enviar do frontend                      |