const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const memeRoutes = require('./routes/memeRoutes');
const authRoutes = require('./routes/authRoutes');
const axios = require('axios')
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/api/memes',memeRoutes);
app.use('/api/auth',authRoutes);
app.get('/api/proxy', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    
    // On définit le type de contenu (image/jpeg, etc.)
    const contentType = response.headers['content-type'];
    res.set('Content-Type', contentType);
    res.set('Access-Control-Allow-Origin', '*'); // ON FORCE L'AUTORISATION ICI
    
    res.send(response.data);
  } catch (err) {
    res.status(500).send("Erreur proxy");
  }
});

// --- CONNEXION MONGODB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connecté à MongoDB Atlas !"))
  .catch((err) => console.error("❌ Erreur de connexion :", err));

app.get('/', (req, res) => {
  res.send('Serveur Memeffy opérationnel !');
});


app.listen(PORT, () => {
  console.log(` Serveur démarré sur le port ${PORT}`);
});