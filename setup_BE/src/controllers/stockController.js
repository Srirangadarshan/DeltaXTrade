const Stock = require('../models/Stock');
const csv = require('csv-parser');
const fs = require('fs');

exports.getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find({}, 'symbol name currentPrice');
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStockById = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loadStocksFromCSV = async (filePath) => {
  try {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        for (const row of results) {
          const stock = new Stock({
            symbol: row.symbol,
            name: row.name,
            currentPrice: parseFloat(row.price),
            historicalData: [{
              date: new Date(row.date),
              price: parseFloat(row.price),
              volume: parseInt(row.volume),
              high: parseFloat(row.high),
              low: parseFloat(row.low)
            }]
          });
          await stock.save();
        }
        console.log('CSV 