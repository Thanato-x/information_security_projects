const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  this.timeout(5000);

  let testThreadId;
  let testReplyId;
  const board = 'testboard';

  suite('Threads', () => {

    test('POST /api/threads/:board', done => {
      chai.request(server)
        .post(`/api/threads/${board}`)
        .send({
          text: 'Test thread',
          delete_password: 'pass123'
        })
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          done();
        });
    });

    test('GET /api/threads/:board', done => {
      chai.request(server)
        .get(`/api/threads/${board}`)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isAtMost(res.body.length, 10);
          assert.property(res.body[0], 'text');
          assert.notProperty(res.body[0], 'delete_password');
          testThreadId = res.body[0]._id;
          done();
        });
    });

    test('PUT /api/threads/:board (report)', done => {
      chai.request(server)
        .put(`/api/threads/${board}`)
        .send({ thread_id: testThreadId })
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported');
          done();
        });
    });

    test('DELETE /api/threads/:board (incorrect password)', done => {
      chai.request(server)
        .delete(`/api/threads/${board}`)
        .send({
          thread_id: testThreadId,
          delete_password: 'wrongpass'
        })
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });
  });

  suite('Replies', () => {

    test('POST /api/replies/:board', done => {
      chai.request(server)
        .post(`/api/replies/${board}`)
        .send({
          thread_id: testThreadId,
          text: 'Test reply',
          delete_password: 'replypass'
        })
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          done();
        });
    });

    test('GET /api/replies/:board', done => {
      chai.request(server)
        .get(`/api/replies/${board}`)
        .query({ thread_id: testThreadId })
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.property(res.body, 'replies');
          assert.isArray(res.body.replies);
          assert.isAbove(res.body.replies.length, 0);
          testReplyId = res.body.replies[0]._id;
          done();
        });
    });

    test('PUT /api/replies/:board (report)', done => {
      chai.request(server)
        .put(`/api/replies/${board}`)
        .send({
          thread_id: testThreadId,
          reply_id: testReplyId
        })
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported');
          done();
        });
    });

    test('DELETE /api/replies/:board (incorrect password)', done => {
      chai.request(server)
        .delete(`/api/replies/${board}`)
        .send({
          thread_id: testThreadId,
          reply_id: testReplyId,
          delete_password: 'wrongpass'
        })
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    test('DELETE /api/replies/:board (correct password)', done => {
      chai.request(server)
        .delete(`/api/replies/${board}`)
        .send({
          thread_id: testThreadId,
          reply_id: testReplyId,
          delete_password: 'replypass'
        })
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
    });
  });

  suite('Final thread deletion (correct password)', () => {
    test('DELETE /api/threads/:board (correct password)', done => {
      chai.request(server)
        .delete(`/api/threads/${board}`)
        .send({
          thread_id: testThreadId,
          delete_password: 'pass123'
        })
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
    });
  });
});
