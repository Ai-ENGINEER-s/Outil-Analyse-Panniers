import express from 'express';
import mongoose from 'mongoose';
import analyticsRouter from './routes/analytics';
import { loadData } from './dataProcessing';

const app = express();

// Connexion à MongoDB
mongoose.connect('mongodb+srv://sbarry:24GUh2N4AAZhdg8Q@cluster0.o2mkt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Connecté à MongoDB');
    loadData(); // Charger les données après la connexion réussie
  })
  .catch(err => {
    console.error('Erreur de connexion à MongoDB', err);
  });

// Middleware
app.use(express.json());

// Routes
app.use(analyticsRouter);

// Démarrer le serveur
const port = process.env.PORT || 4000; // Utiliser une variable d'environnement pour le port (pour des déploiements comme Heroku)
app.listen(port, '0.0.0.0', () => { // 0.0.0.0 pour écouter sur toutes les interfaces réseau
  console.log(`Serveur en cours d'exécution sur http://0.0.0.0:${port}`);
});
