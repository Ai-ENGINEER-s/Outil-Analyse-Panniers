import fs from 'fs';
import csv from 'csv-parser';
import Sale from '../models/Sale';
import Product from '../models/Product';
import mongoose from 'mongoose';

// Fonction pour charger les produits et les ventes
const loadData = async () => {
  // Charger les produits depuis le fichier CSV
  fs.createReadStream('products.csv')
    .pipe(csv())
    .on('data', async (row) => {
      const product = new Product({
        ProductID: row.ProductID,
        ProductName: row.ProductName,
        Category: row.Category,
        Price: parseFloat(row.Price), // Convertir le prix en nombre
      });
      await product.save();
    })
    .on('end', () => {
      console.log('Produits chargés');
    });

  // Charger les ventes depuis le fichier CSV
  fs.createReadStream('sales.csv')
    .pipe(csv())
    .on('data', async (row) => {
      const sale = new Sale({
        SaleID: row.SaleID,
        ProductID: row.ProductID,
        Quantity: parseInt(row.Quantity, 10), // Convertir la quantité en nombre
        Date: new Date(row.Date), // Convertir la date en objet Date
        TotalAmount: parseFloat(row.TotalAmount), // Convertir le montant total en nombre
      });
      await sale.save();
    })
    .on('end', () => {
      console.log('Ventes chargées');
    });
};



// Connexion à MongoDB sans les options obsolètes
mongoose.connect('mongodb://localhost:27017/salesDB')
  .then(() => {
    console.log('Connecté à MongoDB');
    loadData(); // Charger les données après la connexion réussie
  })
  .catch(err => {
    console.error('Erreur de connexion à MongoDB', err);
  });
