API BACKEND  : 


# GET /analytics/total_sales 

Retourne le montant total des ventes pour la période sélectionnée.
### Reponse : 
[
  // 1. Filtrer par période (ajustez les dates ici)
  {
    $match: {
      Date: {
        $gte: "2023-07-12", // Date de début de la période
        $lte: "2023-12-31"  // Date de fin de la période
      }
    }
  },
  // 2. Convertir le champ TotalAmount en numérique pour l'agrégation
  {
    $project: {
      TotalAmount: { $toDouble: "$TotalAmount" } // Conversion du montant total
    }
  },
  // 3. Calculer la somme totale des ventes pour la période
  {
    $group: {
      _id: null, // Pas de regroupement spécifique, on veut une somme globale
      totalSalesAmount: { $sum: "$TotalAmount" } // Somme des montants totaux
    }
  },
  // 4. Formater la sortie finale
  {
    $project: {
      _id: 0, // Supprimer _id de la sortie
      totalSalesAmount: 1
    }
  }
]


# GET /analytics/trending_products 

Retourne une liste des 3 produits les plus
vendus, avec leur nom, quantité vendue et montant total des ventes pour
chacun.

### Reponse : 


[
  // 1. Jointure avec la collection products
  {
    $lookup: {
      from: "products", // Nom de la collection des produits
      localField: "ProductID", // Champ dans la collection sales
      foreignField: "ProductID", // Champ correspondant dans la collection products
      as: "productDetails"
    }
  },
  // 2. Décomposer le tableau résultant de la jointure
  {
    $unwind: "$productDetails"
  },
  // 3. Projeter les champs nécessaires et convertir les types
  {
    $project: {
      ProductName: "$productDetails.ProductName", // Nom du produit
      Quantity: { $toInt: "$Quantity" }, // Conversion de Quantity en entier
      TotalAmount: { $toDouble: "$TotalAmount" } // Conversion de TotalAmount en nombre
    }
  },
  // 4. Grouper par produit pour calculer les métriques
  {
    $group: {
      _id: "$ProductName", // Grouper par nom de produit
      totalQuantity: { $sum: "$Quantity" }, // Somme des quantités vendues
      totalSalesAmount: { $sum: "$TotalAmount" } // Somme des montants totaux
    }
  },
  // 5. Trier par quantité totale vendue décroissante
  {
    $sort: { totalQuantity: -1 }
  },
  // 6. Limiter le résultat aux 3 produits les plus vendus
  {
    $limit: 3
  }
]



# GET /analytics/category_sales 

 Retourne la répartition des ventes par catégorie,
en indiquant le nombre de ventes, et le pourcentage.

### Reponse : 


[
  {
    $lookup: {
      from: "products",
      localField: "ProductID",
      foreignField: "ProductID",
      as: "productDetails"
    }
  },
  {
    $unwind: "$productDetails"
  },
  {
    $group: {
      _id: "$productDetails.Category",
      totalSales: { $sum: { $toDouble: "$TotalAmount" } },
      salesCount: { $sum: 1 }
    }
  },
  {
    $group: {
      _id: null,
      totalGlobalSales: { $sum: "$totalSales" },
      categories: {
        $push: {
          category: "$_id",
          totalSales: "$totalSales",
          salesCount: "$salesCount"
        }
      }
    }
  },
  {
    $unwind: "$categories"
  },
  {
    $project: {
      category: "$categories.category",
      salesCount: "$categories.salesCount",
      totalSales: "$categories.totalSales",
      percentage: {
        $multiply: [
          { $divide: ["$categories.totalSales", "$totalGlobalSales"] },
          100
        ]
      },
      _id: 0 // Supprimer le champ _id
    }
  },
  {
    $sort: { percentage: -1 }
  }
]



# GET /products 

 Retourne un tableau des produits avec le nombre de ventes
pour chaque produit.

### Reponse : 

[
  {
    $lookup: {
      from: "products", // Collection à joindre
      localField: "ProductID", // Champ dans la collection sales
      foreignField: "ProductID", // Champ dans la collection products
      as: "productInfo" // Nom du tableau résultant
    }
  },
  {
    $unwind: "$productInfo" // Décompose le tableau en documents individuels
  },
  {
    $group: {
      _id: "$productInfo.ProductID", // Groupement par ProductID
      ProductName: { $first: "$productInfo.ProductName" }, // Nom du produit
      TotalSales: { $sum: { $toInt: "$Quantity" } }, // Somme des quantités vendues
      TotalRevenue: { $sum: { $toDouble: "$TotalAmount" } } // Somme des revenus
    }
  },
  {
    $project: {
      _id: 0, // Masquer l'ID par défaut
      ProductID: "$_id",
      ProductName: 1,
      TotalSales: 1,
      TotalRevenue: 1
    }
  }
]