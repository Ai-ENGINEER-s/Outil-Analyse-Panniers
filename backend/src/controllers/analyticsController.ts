import { Request, Response } from 'express';
import { Product } from '../models/Product';
import Sale from '../models/sale';

// 1. Total Sales
export const totalSales = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const totalSales = await Sale.aggregate([
      {
        $match: {
          Date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: '$TotalAmount' } },
        },
      },
    ]);
    res.json(totalSales);
  } catch (err) {
    res.status(500).send('Error fetching total sales');
  }
};

// 2. Trending Products
export const trendingProducts = async (req: Request, res: Response) => {
  try {
    const trendingProducts = await Sale.aggregate([
      {
        $group: {
          _id: '$ProductID',
          totalQuantity: { $sum: { $toInt: '$Quantity' } },
          totalAmount: { $sum: { $toDouble: '$TotalAmount' } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 3 },
    ]);

    const productDetails = await Promise.all(
      trendingProducts.map(async (product) => {
        const productInfo = await Product.findOne({ ProductID: product._id });
        return {
          productName: productInfo?.ProductName,
          quantitySold: product.totalQuantity,
          totalAmount: product.totalAmount,
        };
      })
    );
    res.json(productDetails);
  } catch (err) {
    res.status(500).send('Error fetching trending products');
  }
};

// 3. Sales by Category
export const categorySales = async (req: Request, res: Response) => {
  try {
    const salesByCategory = await Sale.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'ProductID',
          foreignField: 'ProductID',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.Category',
          totalSales: { $sum: { $toDouble: '$TotalAmount' } },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalSalesAmount = salesByCategory.reduce((acc, category) => acc + category.totalSales, 0);

    const salesWithPercentage = salesByCategory.map((category) => ({
      category: category._id,
      sales: category.totalSales,
      percentage: (category.totalSales / totalSalesAmount) * 100,
    }));

    res.json(salesWithPercentage);
  } catch (err) {
    res.status(500).send('Error fetching category sales');
  }
};

// 4. Products with Sales
export const productsWithSales = async (req: Request, res: Response) => {
  try {
    const productsSales = await Sale.aggregate([
      {
        $group: {
          _id: '$ProductID',
          totalQuantity: { $sum: { $toInt: '$Quantity' } },
        },
      },
    ]);

    const productDetails = await Promise.all(
      productsSales.map(async (product) => {
        const productInfo = await Product.findOne({ ProductID: product._id });
        return {
          productName: productInfo?.ProductName,
          quantitySold: product.totalQuantity,
        };
      })
    );
    res.json(productDetails);
  } catch (err) {
    res.status(500).send('Error fetching products with sales');
  }
};
