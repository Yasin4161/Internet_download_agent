const express = require('express');
const ytdl = require('ytdl-core');
const router = express.Router();

// YouTube URL doğrulama fonksiyonu
function isValidYouTubeURL(url) {
  const regex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return regex.test(url);
}

// Video bilgilerini getirme endpoint'i
router.get('/info', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        error: 'URL gerekli',
        message: 'Lütfen bir YouTube URL\'si girin'
      });
    }

    if (!isValidYouTubeURL(url)) {
      return res.status(400).json({
        error: 'Geçersiz URL',
        message: 'Lütfen geçerli bir YouTube URL\'si girin'
      });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({
        error: 'Geçersiz YouTube URL\'si',
        message: 'Bu URL\'den video bilgileri alınamıyor'
      });
    }

    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;

    // Video formatlarını filtrele ve organize et
    const formats = info.formats
      .filter(format => format.hasVideo && format.hasAudio)
      .map(format => ({
        quality: format.qualityLabel,
        container: format.container,
        size: format.contentLength ? Math.round(format.contentLength / 1024 / 1024) + ' MB' : 'Bilinmiyor'
      }))
      .filter((format, index, arr) => 
        arr.findIndex(f => f.quality === format.quality) === index
      );

    const videoInfo = {
      title: videoDetails.title,
      duration: videoDetails.lengthSeconds,
      thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length - 1]?.url,
      author: videoDetails.author.name,
      viewCount: videoDetails.viewCount,
      description: videoDetails.shortDescription,
      formats: formats
    };

    res.json({
      success: true,
      data: videoInfo
    });

  } catch (error) {
    console.error('Video bilgisi alma hatası:', error);
    res.status(500).json({
      error: 'Video bilgisi alınamadı',
      message: 'Video bilgileri yüklenirken bir hata oluştu'
    });
  }
});

// Video indirme endpoint'i
router.get('/download', async (req, res) => {
  try {
    const { url, quality = 'highest' } = req.query;

    if (!url) {
      return res.status(400).json({
        error: 'URL gerekli',
        message: 'Lütfen bir YouTube URL\'si girin'
      });
    }

    if (!isValidYouTubeURL(url)) {
      return res.status(400).json({
        error: 'Geçersiz URL',
        message: 'Lütfen geçerli bir YouTube URL\'si girin'
      });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({
        error: 'Geçersiz YouTube URL\'si',
        message: 'Bu URL\'den video indirilemez'
      });
    }

    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;

    // Kalite seçeneklerine göre format bul
    let format;
    if (quality === 'highest') {
      format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
    } else if (quality === 'lowest') {
      format = ytdl.chooseFormat(info.formats, { quality: 'lowest' });
    } else {
      format = ytdl.chooseFormat(info.formats, { quality: quality });
    }

    if (!format) {
      return res.status(404).json({
        error: 'Format bulunamadı',
        message: 'İstenen kalitede video bulunamadı'
      });
    }

    // Video dosya adını temizle
    const cleanTitle = videoDetails.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
    
    res.setHeader('Content-Disposition', `attachment; filename="${cleanTitle}.${format.container}"`);
    res.setHeader('Content-Type', format.mimeType);

    // Video stream'ini client'a pipe et
    const videoStream = ytdl(url, { format: format });
    videoStream.pipe(res);

    videoStream.on('error', (error) => {
      console.error('Video stream hatası:', error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'İndirme hatası',
          message: 'Video indirilirken bir hata oluştu'
        });
      }
    });

  } catch (error) {
    console.error('Video indirme hatası:', error);
    res.status(500).json({
      error: 'İndirme hatası',
      message: 'Video indirilirken bir hata oluştu'
    });
  }
});

// Kalite seçeneklerini getirme endpoint'i
router.get('/formats', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        error: 'URL gerekli',
        message: 'Lütfen bir YouTube URL\'si girin'
      });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({
        error: 'Geçersiz YouTube URL\'si',
        message: 'Bu URL geçerli değil'
      });
    }

    const info = await ytdl.getInfo(url);
    
    const formats = info.formats
      .filter(format => format.hasVideo && format.hasAudio)
      .map(format => ({
        itag: format.itag,
        quality: format.qualityLabel,
        container: format.container,
        size: format.contentLength ? Math.round(format.contentLength / 1024 / 1024) + ' MB' : 'Bilinmiyor',
        fps: format.fps
      }))
      .filter((format, index, arr) => 
        arr.findIndex(f => f.quality === format.quality && f.container === format.container) === index
      )
      .sort((a, b) => {
        const qualityOrder = { '2160p': 4, '1440p': 3, '1080p': 2, '720p': 1, '480p': 0, '360p': -1, '240p': -2, '144p': -3 };
        return (qualityOrder[b.quality] || -4) - (qualityOrder[a.quality] || -4);
      });

    res.json({
      success: true,
      formats: formats
    });

  } catch (error) {
    console.error('Format listesi alma hatası:', error);
    res.status(500).json({
      error: 'Format listesi alınamadı',
      message: 'Video formatları yüklenirken bir hata oluştu'
    });
  }
});

module.exports = router;