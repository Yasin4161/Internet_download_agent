const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const videoRoutes = require('./routes/video');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/video', videoRoutes);

// Ana route
app.get('/', (req, res) => {
  res.json({
    message: 'YouTube Video Downloader Backend API',
    endpoints: {
      'GET /api/video/info': 'Video bilgilerini getir',
      'GET /api/video/download': 'Video indirme linki al'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint bulunamadı',
    message: 'Lütfen geçerli bir endpoint kullanın'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'Sunucu hatası',
    message: 'Bir şeyler yanlış gitti'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
  console.log(`📋 API Dokümantasyonu: http://localhost:${PORT}`);
});