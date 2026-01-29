const express = require('express');
const router = express.Router();
const Meme = require('../models/Meme');
const jwt = require('jsonwebtoken');

// --- MIDDLEWARE DE PROTECTION ---
// Ce code vérifie si l'utilisateur est connecté avant d'autoriser l'action
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ error: "Accès refusé. Connectez-vous." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // On récupère l'ID de l'utilisateur contenu dans le token
    next();
  } catch (e) {
    res.status(400).json({ error: "Session expirée ou invalide." });
  }
};

// --- ROUTES ---

// 1. SAUVEGARDER (Sécurisé avec auth)
router.post('/save', auth, async (req, res) => {
  try {
    const { imageUrl, topText, bottomText, authorName } = req.body;
    
    const newMeme = new Meme({ 
      imageUrl, 
      topText, 
      bottomText,
      author: req.user.id, // ID extrait du Token
      authorName: authorName // Nom affiché
    });

    await newMeme.save();
    res.status(201).json({ message: "Mème publié !", data: newMeme });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la sauvegarde" });
  }
});

// 2. RÉCUPÉRER TOUT (Public)
router.get('/all', async (req, res) => {
  try {
    const memes = await Meme.find().sort({ createdAt: -1 });
    res.json(memes);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération" });
  }
});

// 3. SUPPRIMER (Sécurisé avec auth)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Optionnel : on pourrait vérifier ici si req.user.id === meme.author
    await Meme.findByIdAndDelete(req.params.id);
    res.json({ message: "Mème supprimé avec succès !" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

module.exports = router;