const mongoose = require("mongoose");
const cursos = require('./lists/cursos');
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
  uc:{type: String, required: true, trim: true, default: ""}, 
  titulo:{type: String, required: true, trim: true, default: ""},
  descricao:{type: String,default: "",trim: true},
  tipo: { type: String, required: true, trim: true, default: "",enum: fileTypes }, // Ex: "PDF", "Video", etc.

  rating: { type: Number, default: 0, validate: {validator: (v) => v >= 0 && v <= 5, message: 'Rating deve ser entre 0 e 5'} }, // Média das classificações
  ratingCount: { type: Number, default: 0, min: 0 }, 
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FileMeta", FileMetaSchema);
