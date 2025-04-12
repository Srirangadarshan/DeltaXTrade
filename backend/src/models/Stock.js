const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  historicalData: [{
    date: Date,
    price: Number,
    volume: Number,
    high: Number,
    low: Number
  }]
});

module.exports = mongoose.model('Stock', stockSchema); 