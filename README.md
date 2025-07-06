# YouTube Video Downloader Backend

Bu proje, YouTube videolarını indirmek için geliştirilmiş bir backend API'sidir. Express.js ve ytdl-core kütüphanesi kullanarak YouTube videolarının bilgilerini alma ve indirme işlemlerini gerçekleştirir.

## 🚀 Özellikler

- ✅ YouTube video bilgilerini getirme
- ✅ Video kalite seçeneklerini listeleme  
- ✅ Video indirme linkleri sağlama
- ✅ CORS desteği (frontend entegrasyonu için)
- ✅ Hata yönetimi
- ✅ Güvenlik önlemleri (Helmet.js)

## 📋 API Endpoints

### 1. Video Bilgilerini Getirme
```
GET /api/video/info?url=YOUTUBE_URL
```

**Örnek Yanıt:**
```json
{
  "success": true,
  "data": {
    "title": "Video Başlığı",
    "duration": "180",
    "thumbnail": "https://...",
    "author": "Kanal Adı",
    "viewCount": "1000000",
    "description": "Video açıklaması...",
    "formats": [...]
  }
}
```

### 2. Video İndirme
```
GET /api/video/download?url=YOUTUBE_URL&quality=highest
```

Kalite seçenekleri: `highest`, `lowest`, `720p`, `1080p`, vb.

### 3. Kalite Seçeneklerini Listeleme
```
GET /api/video/formats?url=YOUTUBE_URL
```

## 🛠️ Kurulum

1. **Repository'yi klonlayın:**
```bash
git clone <repository-url>
cd youtube-downloader-backend
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Sunucuyu başlatın:**
```bash
# Geliştirme modu
npm run dev

# Üretim modu
npm start
```

4. **API'ye erişin:**
```
http://localhost:3000
```

## 📦 Kullanılan Teknolojiler

- **Express.js** - Web framework
- **ytdl-core** - YouTube video indirme
- **CORS** - Cross-origin istekler için
- **Helmet** - Güvenlik
- **dotenv** - Çevre değişkenleri

## 🔧 Ortam Değişkenleri

`.env` dosyasında şu değişkenleri ayarlayabilirsiniz:

```env
PORT=3000
NODE_ENV=development
```

## 🚦 Kullanım Örnekleri

### JavaScript ile Frontend Entegrasyonu

```javascript
// Video bilgilerini alma
const getVideoInfo = async (url) => {
  const response = await fetch(`http://localhost:3000/api/video/info?url=${encodeURIComponent(url)}`);
  const data = await response.json();
  return data;
};

// Video indirme linki alma
const downloadVideo = (url, quality = 'highest') => {
  const downloadUrl = `http://localhost:3000/api/video/download?url=${encodeURIComponent(url)}&quality=${quality}`;
  window.open(downloadUrl, '_blank');
};
```

## ⚠️ Önemli Notlar

- Bu API sadece eğitim amaçlıdır
- YouTube'un kullanım şartlarına uygun kullanım yapınız
- Telif hakkı korumalı içerikleri indirmeden önce izin alınız
- Yoğun kullanım için rate limiting eklenebilir

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🔗 İlgili Projeler

- Frontend Repository: [YouTube Downloader Frontend] (ayrı repository'de)

---

**Not:** Bu backend API'si, frontend uygulaması ile birlikte kullanılmak üzere tasarlanmıştır. Frontend uygulamasını ayrı bir repository'de geliştirip bu API ile entegre edebilirsiniz.