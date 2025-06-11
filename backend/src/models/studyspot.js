const mongoose = require('mongoose');

const studySpotSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: String,
  localizacao: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  criadoEm: { type: Date, default: Date.now }
});

studySpotSchema.index({ localizacao: '2dsphere' });

module.exports = mongoose.model('StudySpot', studySpotSchema);