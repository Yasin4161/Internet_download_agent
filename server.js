const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const path = require('path');
const sanitize = require('sanitize-filename');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Get video info
app.post('/api/info', async (req, res) => {
    try {
        console.log('API info request received:', req.body);
        const { url } = req.body;
        
        if (!url) {
            console.log('No URL provided');
            return res.status(400).json({ error: 'URL gerekli' });
        }

        if (!ytdl.validateURL(url)) {
            console.log('Invalid YouTube URL:', url);
            return res.status(400).json({ error: 'Geçersiz YouTube URL\'si' });
        }

        console.log('Getting video info for:', url);
        const info = await ytdl.getInfo(url);
        const videoDetails = info.videoDetails;
        
        if (!videoDetails) {
            return res.status(500).json({ error: 'Video detayları alınamadı' });
        }

        const formats = ytdl.filterFormats(info, 'audioandvideo');
        const audioFormats = ytdl.filterFormats(info, 'audioonly');
        
        const videoFormats = formats.slice(0, 5).map(format => ({
            quality: format.qualityLabel || format.height ? `${format.height}p` : 'Bilinmeyen',
            container: format.container,
            hasAudio: format.hasAudio,
            hasVideo: format.hasVideo,
            itag: format.itag
        }));

        const audioOnly = audioFormats.slice(0, 3).map(format => ({
            quality: format.audioBitrate ? `${format.audioBitrate}kbps` : 'Bilinmeyen',
            container: format.container,
            itag: format.itag
        }));

        const responseData = {
            title: videoDetails.title || 'Bilinmeyen',
            thumbnail: videoDetails.thumbnails && videoDetails.thumbnails[0] ? videoDetails.thumbnails[0].url : '',
            duration: videoDetails.lengthSeconds || 0,
            author: videoDetails.author ? videoDetails.author.name : 'Bilinmeyen',
            videoFormats,
            audioFormats: audioOnly
        };

        console.log('Sending response:', responseData);
        res.json(responseData);
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ error: 'Video bilgileri alınırken hata oluştu: ' + error.message });
    }
});

// Download video
app.get('/api/download', async (req, res) => {
    try {
        console.log('Download request:', req.query);
        const { url, itag } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL gerekli' });
        }

        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Geçersiz YouTube URL\'si' });
        }

        if (!itag) {
            return res.status(400).json({ error: 'Format seçimi gerekli' });
        }

        console.log('Getting video info for download:', url);
        const info = await ytdl.getInfo(url);
        
        if (!info || !info.videoDetails) {
            return res.status(500).json({ error: 'Video bilgileri alınamadı' });
        }

        const format = ytdl.chooseFormat(info, { quality: itag });
        const title = sanitize(info.videoDetails.title || 'video');
        
        res.header('Content-Disposition', `attachment; filename="${title}.${format.container}"`);
        res.header('Content-Type', format.mimeType || 'video/mp4');
        
        console.log('Starting download stream for:', title);
        const stream = ytdl(url, { quality: itag });
        
        stream.on('error', (err) => {
            console.error('Stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'İndirme hatası' });
            }
        });

        stream.pipe(res);
    } catch (error) {
        console.error('Download error:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'İndirme sırasında hata oluştu: ' + error.message });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
    console.log(`http://localhost:${PORT} adresinden erişebilirsiniz`);
});