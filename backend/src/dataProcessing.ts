import fs from 'fs';
import csvParser from 'csv-parser';
import Product  from './models/Product';
import  Sale  from './models/Sale';

export const loadData = () => {
  // Charger les produits
  fs.createReadStream('data/products.csv')
    .pipe(csvParser())
    .on('data', async (row) => {
      const product = new Product({
        ProductID: row.ProductID,
        ProductName: row.ProductName,
        Category: row.Category,
        Price: parseFloat(row.Price)
      });
      await product.save();
    })
    .on('end', () => {
      console.log('Chargement des produits terminé');
    });

  // Charger les ventes
  fs.createReadStream('data/sales.csv')
    .pipe(csvParser())
    .on('data', async (row) => {
      const sale = new Sale({
        SaleID: row.SaleID,
        ProductID: row.ProductID,
        Quantity: parseInt(row.Quantity),
        Date: new Date(row.Date),
        TotalAmount: parseFloat(row.TotalAmount)
      });
      await sale.save();
    })
    .on('end', () => {
      console.log('Chargement des ventes terminé');
    });
};
