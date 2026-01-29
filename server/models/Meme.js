const mongoose = require('mongoose');

const MemeSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  topText: { type: String },
  bottomText: { type: String },
  authorId: { type: String }, // On stocke l'ID de celui qui a créé
  authorName: { type: String }, // On stocke le nom pour l'affichage
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Meme', MemeSchema);