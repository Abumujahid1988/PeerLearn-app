require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const progressRoutes = require('./routes/progressRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');

const reviewRoutes = require('./routes/reviewRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const contactRoutes = require('./routes/contactRoutes');

const http = require('http');
const { Server } = require('socket.io');


const path = require('path');
const app = express();

// Trust proxy for secure cookies and HTTPS on Render
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Helmet config: allow cross-origin resource policy for static assets
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));
app.use(cors({ origin: process.env.CLIENT_ALLOWED_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Friendly JSON parse error handler - returns 400 with a readable message
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    console.error('JSON parse error on request:', err.message);
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  next(err);
});



app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/assignments', assignmentRoutes);


app.get('/', (req, res) => {
  res.json({ status: "Backend running" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  const server = http.createServer(app);

  // Setup Socket.io
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ALLOWED_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    }
  });

  // Make io available in controllers via req.app.get('io')
  app.set('io', io);
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('joinRoom', ({ room }) => {
      if (!room) return;
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on('leaveRoom', ({ room }) => {
      if (!room) return;
      socket.leave(room);
      console.log(`Socket ${socket.id} left room ${room}`);
    });

    // chatMessage: { room, message, user }
    socket.on('chatMessage', async (data) => {
      try {
        const { room, message, user } = data || {};
        if (!room || !message) return;
        // persist message to database
        try {
          const Message = require('./models/Message');
          const saved = await Message.create({ room, message, user: { _id: user?._id, name: user?.name } });
          const payload = { _id: saved._id, message: saved.message, user: saved.user, createdAt: saved.createdAt };
          // broadcast the saved message to room
          io.to(room).emit('chatMessage', payload);
        } catch (dbErr) {
          console.error('Failed to save chat message', dbErr);
          // still broadcast without id if save fails
          const payload = { message, user, createdAt: new Date() };
          io.to(room).emit('chatMessage', payload);
        }
      } catch (err) {
        console.error('chatMessage handler error', err);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', socket.id, reason);
    });
  });

  server.listen(PORT, () => {
    console.log(`Server (with Socket.io) started on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
  });
});
