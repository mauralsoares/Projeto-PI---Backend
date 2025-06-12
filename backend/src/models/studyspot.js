const mongoose = require('mongoose');

const studySpotSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: String,
  localizacao: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  cidade: { type: String, required: true,trim:true, default: '' }, 
  morada: { type: String, required: true,trim:true,default: '' }, 
  codigoPostal: {
    type: String,
    required: true, trim: true,
    //match: [/^\d{4}-\d{3}$/, 'O código postal deve ter o formato NNNN-NNN']
  },
  criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  criadoEm: { type: Date, default: Date.now }
});

studySpotSchema.index({ localizacao: '2dsphere' });

module.exports = mongoose.model('StudySpot', studySpotSchema);