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

const app = express();
app.use(helmet());
app.use(morgan('dev'));
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
app.use('/api/progress', progressRoutes);

app.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log('Congratulations! Server started on port', PORT));
});
