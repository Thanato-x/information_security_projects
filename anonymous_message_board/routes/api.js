'use strict';
const mongoose = require('mongoose');

const Thread = require('../models/Thread');

module.exports = function (app) {

  app.post('/api/threads/:board', async (req, res) => {
    const { board } = req.params;
    const { text, delete_password } = req.body;

    try {
      const now = new Date();
      const thread = new Thread({
        board,
        text,
        delete_password,
        created_on: now,
        bumped_on: now,
        reported: false,
        replies: []
      });

      await thread.save();
      // FCC espera status 200 e pode ser só um texto simples
      res.status(200).send('success');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error creating thread');
    }
  });

  app.get('/api/threads/:board', async (req, res) => {
    const { board } = req.params;

    try {
      const threads = await Thread.find({ board })
        .sort({ bumped_on: -1 })
        .limit(10)
        .select('-reported -delete_password')
        .lean();

      threads.forEach(thread => {
        thread.replycount = thread.replies.length;
        thread.replies = thread.replies
          .slice(-3)
          .map(reply => {
            const { _id, text, created_on } = reply;
            return { _id, text, created_on };
          });
      });

      res.status(200).json(threads);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching threads');
    }
  });

  app.post('/api/replies/:board', async (req, res) => {
    const { board } = req.params;
    const { thread_id, text, delete_password } = req.body;

    try {
      const reply = {
        _id: new mongoose.Types.ObjectId(),
        text,
        delete_password,
        created_on: new Date(),
        reported: false
      };

      const thread = await Thread.findByIdAndUpdate(
        thread_id,
        {
          $push: { replies: reply },
          $set: { bumped_on: new Date() }
        },
        { new: true }
      );

      if (!thread) {
        return res.status(404).send('Thread not found');
      }

      // FCC espera status 200 e texto simples
      res.status(200).send('success');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error adding reply');
    }
  });

  app.get('/api/replies/:board', async (req, res) => {
    const { thread_id } = req.query;

    try {
      const thread = await Thread.findById(thread_id)
        .select('-delete_password -reported -replies.delete_password -replies.reported')
        .lean();

      if (!thread) {
        return res.status(404).send('Thread not found');
      }

      thread.replies = thread.replies.map(reply => {
        const { _id, text, created_on } = reply;
        return { _id, text, created_on };
      });

      res.status(200).json(thread);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching thread');
    }
  });

  app.delete('/api/threads/:board', async (req, res) => {
    const { thread_id, delete_password } = req.body;

    try {
      const thread = await Thread.findById(thread_id);

      if (!thread) {
        return res.status(404).send('Thread not found');
      }

      if (thread.delete_password !== delete_password) {
        return res.status(200).send('incorrect password');
      }

      await Thread.findByIdAndDelete(thread_id);
      res.status(200).send('success');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error deleting thread');
    }
  });

  app.delete('/api/replies/:board', async (req, res) => {
    const { thread_id, reply_id, delete_password } = req.body;

    try {
      const thread = await Thread.findById(thread_id);

      if (!thread) return res.status(404).send('Thread not found');

      const reply = thread.replies.id(reply_id);
      if (!reply) return res.status(404).send('Reply not found');

      if (reply.delete_password !== delete_password) {
        return res.status(200).send('incorrect password');
      }

      reply.text = '[deleted]';
      await thread.save();

      res.status(200).send('success');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error deleting reply');
    }
  });

  app.put('/api/threads/:board', async (req, res) => {
    const { thread_id } = req.body;

    try {
      const thread = await Thread.findByIdAndUpdate(thread_id, { reported: true });

      if (!thread) return res.status(404).send('Thread not found');

      res.status(200).send('reported');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error reporting thread');
    }
  });

  app.put('/api/replies/:board', async (req, res) => {
    const { thread_id, reply_id } = req.body;

    try {
      const thread = await Thread.findById(thread_id);

      if (!thread) return res.status(404).send('Thread not found');

      const reply = thread.replies.id(reply_id);
      if (!reply) return res.status(404).send('Reply not found');

      reply.reported = true;
      await thread.save();

      res.status(200).send('reported');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error reporting reply');
    }
  });
};
