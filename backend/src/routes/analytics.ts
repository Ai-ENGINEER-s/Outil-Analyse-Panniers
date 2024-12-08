import express, { Request, Response } from 'express';
import Product from '../models/Product';
import Sale from '../models/Sale';

const router = express.Router();

// Endpoint 1: Total Sales
router.get('/analytics/total_sales', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const totalSales = await Sale.aggregate([
      {
        $match: {
          Date: { $gte: new Date(startDate as string), $lte: new Date(endDate as string) },
        },
      },
      {
        $project: {
          TotalAmount: { $toDouble: "$TotalAmount" },
        },
      },
      {
        $group: {
          _id: null,
          totalSalesAmount: { $sum: "$TotalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalSalesAmount: 1,
        },
      },
    ]);

    res.json(totalSales);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching total sales');
  }
});

// Endpoint 2: Trending Products
router.get('/analytics/trending_products', async (req: Request, res: Response) => {
  try {
    const trendingProducts = await Sale.aggregate([
      {
        $lookup: {
          from: 'products', // Jointure avec la collection 'products'
          localField: 'ProductID',
          foreignField: 'ProductID',
          as: 'productDetails',
        },
      },
      {
        $unwind: '$productDetails', // Aplatir les résultats du $lookup
      },
      {
        $project: {
          ProductName: '$productDetails.ProductName',
          Quantity: { $toInt: '$Quantity' },
          TotalAmount: { $toDouble: '$TotalAmount' },
        },
      },
      {
        $group: {
          _id: '$ProductName',
          totalQuantity: { $sum: '$Quantity' },
          totalSalesAmount: { $sum: '$TotalAmount' },
        },
      },
      {
        $sort: { totalQuantity: -1 }, // Trier par quantité décroissante
      },
      {
        $limit: 3, // Limiter à 3 produits les plus populaires
      },
    ]);

    res.json(trendingProducts);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching trending products');
  }
});

// Endpoint 3: Category Sales
router.get('/analytics/category_sales', async (req: Request, res: Response) => {
  try {
    const categories = await Product.aggregate([
      {
        $lookup: {
          from: 'sales', // Jointure avec la collection 'sales'
          localField: 'ProductID',
          foreignField: 'ProductID',
          as: 'salesData',
        },
      },
      {
        $project: {
          Category: 1,
          salesData: 1,
        },
      },
    ]);

    const categorySales = categories.map(category => {
      const totalSales = category.salesData.reduce((sum: number, sale: any) => sum + sale.TotalAmount, 0);
      return {
        Category: category.Category,
        TotalSales: totalSales,
      };
    });

    res.json(categorySales);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching category sales');
  }
});

// Endpoint 4: Products with Sales
router.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: 'sales', // Jointure avec la collection 'sales'
          localField: 'ProductID',
          foreignField: 'ProductID',
          as: 'salesData',
        },
      },
      {
        $project: {
          ProductName: 1,
          salesCount: { $size: '$salesData' }, // Compte le nombre de ventes
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching products');
  }
});

export default router;
