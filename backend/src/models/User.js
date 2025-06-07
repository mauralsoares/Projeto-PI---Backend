const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  tipo: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  rates: [
  {
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'uploads.files' },
    nota: { type: Number, min: 0, max: 5 }
  }
],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', UserSchema);