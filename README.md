# YouTube Video İndirici

Modern ve kullanıcı dostu YouTube video indirme sitesi. Video ve ses formatlarında indirme desteği ile.

## Özellikler

- 🎥 YouTube videolarını farklı kalitelerde indirme
- 🎵 Sadece ses dosyası olarak indirme
- 📱 Responsive tasarım (mobil uyumlu)
- 🎨 Modern ve güzel arayüz
- ⚡ Hızlı ve kolay kullanım
- 📋 Video bilgilerini görüntüleme

## Kurulum

1. **Gereksinimler**
   - Node.js (v14 veya üzeri)
   - npm

2. **Projeyi klonlayın**
   ```bash
   git clone <repo-url>
   cd youtube-downloader
   ```

3. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

4. **Uygulamayı başlatın**
   ```bash
   npm start
   ```

   Geliştirme modu için:
   ```bash
   npm run dev
   ```

5. **Tarayıcıda açın**
   ```
   http://localhost:3000
   ```

## Kullanım

1. YouTube video URL'sini girin
2. "Video Bilgilerini Al" butonuna tıklayın
3. İstediğiniz formatı seçin ve indirin

## Teknik Detaylar

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **YouTube API**: ytdl-core
- **Styling**: Modern CSS Grid ve Flexbox

## API Endpoints

- `POST /api/info` - Video bilgilerini al
- `GET /api/download` - Video/ses dosyasını indir

## Bağımlılıklar

- express: Web server
- cors: Cross-origin requests
- ytdl-core: YouTube video indirme
- sanitize-filename: Dosya adı temizleme

## Güvenlik Notu

Bu uygulama eğitim amaçlı geliştirilmiştir. YouTube'un hizmet şartlarına uygun kullanım sorumluluğu kullanıcıya aittir.

## Lisans

MIT License