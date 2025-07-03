const fetch = require('node-fetch');

async function getStockPrice(symbol) {
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data || !data.symbol || !data.latestPrice) {
    throw new Error('Invalid stock symbol');
  }

  return {
    stock: data.symbol,
    price: data.latestPrice
  };
}

module.exports = getStockPrice;
