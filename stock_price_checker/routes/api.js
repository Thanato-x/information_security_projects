'use strict';
const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const getStockPrice = require('../utils/stockService');


router.get('/stock-prices', async (req, res) => {
  try {
    let { stock, like } = req.query;
    const ip = req.ip;
    like = like === 'true';

    if (!stock) return res.status(400).json({ error: 'Stock required' });

    if (typeof stock === 'string') {
      stock = stock.toUpperCase();
      const { stock: stockName, price } = await getStockPrice(stock);

      if (like) {
        const alreadyLiked = await Like.findOne({ stock: stockName, ip });
        if (!alreadyLiked) await Like.create({ stock: stockName, ip });
      }

      const likeCount = await Like.countDocuments({ stock: stockName });

      return res.json({
        stockData: {
          stock: stockName,
          price,
          likes: likeCount
        }
      });
    }

    if (Array.isArray(stock)) {
      const [s1, s2] = stock.map(s => s.toUpperCase());

      const [data1, data2] = await Promise.all([
        getStockPrice(s1),
        getStockPrice(s2)
      ]);

      if (like) {
        const [like1, like2] = await Promise.all([
          Like.findOne({ stock: data1.stock, ip }),
          Like.findOne({ stock: data2.stock, ip })
        ]);

        if (!like1) await Like.create({ stock: data1.stock, ip });
        if (!like2) await Like.create({ stock: data2.stock, ip });
      }

      const [likes1, likes2] = await Promise.all([
        Like.countDocuments({ stock: data1.stock }),
        Like.countDocuments({ stock: data2.stock })
      ]);

      return res.json({
        stockData: [
          {
            stock: data1.stock,
            price: data1.price,
            rel_likes: likes1 - likes2
          },
          {
            stock: data2.stock,
            price: data2.price,
            rel_likes: likes2 - likes1
          }
        ]
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
