const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

const { assert } = chai;
chai.use(chaiHttp);

let likesBefore = 0;

describe('Functional Tests', function () {
  this.timeout(5000);

  describe('GET /api/stock-prices => stockData object', () => {

    it('1 stock', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'GOOG' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body.stockData);
          assert.property(res.body.stockData, 'stock');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          done();
        });
    });

    it('1 stock with like', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'GOOG', like: 'true' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body.stockData);
          likesBefore = res.body.stockData.likes;
          assert.isAbove(likesBefore, 0);
          done();
        });
    });

    it('1 stock with like again (same IP)', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'GOOG', like: 'true' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.likes, likesBefore);
          done();
        });
    });

    it('2 stocks', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: ['GOOG', 'MSFT'] })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData);
          assert.lengthOf(res.body.stockData, 2);
          assert.property(res.body.stockData[0], 'rel_likes');
          assert.property(res.body.stockData[1], 'rel_likes');
          done();
        });
    });

    it('2 stocks with like', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: ['GOOG', 'MSFT'], like: 'true' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          const [s1, s2] = res.body.stockData;
          assert.equal(s1.rel_likes, -s2.rel_likes);
          done();
        });
    });

  });
});
