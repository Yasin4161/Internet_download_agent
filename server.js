const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
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
        const { url } = req.body;
        
        if (!url || !ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Geçersiz YouTube URL\'si' });
        }

        const info = await ytdl.getInfo(url);
        const videoDetails = info.videoDetails;
        
        const formats = ytdl.filterFormats(info, 'audioandvideo');
        const audioFormats = ytdl.filterFormats(info, 'audioonly');
        
        const videoFormats = formats.map(format => ({
            quality: format.qualityLabel || 'Bilinmeyen',
            container: format.container,
            hasAudio: format.hasAudio,
            hasVideo: format.hasVideo,
            itag: format.itag
        }));

        const audioOnly = audioFormats.map(format => ({
            quality: format.audioBitrate ? `${format.audioBitrate}kbps` : 'Bilinmeyen',
            container: format.container,
            itag: format.itag
        }));

        res.json({
            title: videoDetails.title,
            thumbnail: videoDetails.thumbnails[0]?.url,
            duration: videoDetails.lengthSeconds,
            author: videoDetails.author.name,
            videoFormats,
            audioFormats: audioOnly
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Video bilgileri alınırken hata oluştu' });
    }
});

// Download video
app.get('/api/download', async (req, res) => {
    try {
        const { url, itag } = req.query;
        
        if (!url || !ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Geçersiz YouTube URL\'si' });
        }

        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info, { quality: itag });
        const title = sanitize(info.videoDetails.title);
        
        res.header('Content-Disposition', `attachment; filename="${title}.${format.container}"`);
        res.header('Content-Type', format.mimeType);
        
        ytdl(url, { quality: itag }).pipe(res);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'İndirme sırasında hata oluştu' });
    }
});

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
    console.log(`http://localhost:${PORT} adresinden erişebilirsiniz`);
});