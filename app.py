from flask import Flask, request, jsonify, send_file, after_this_request
import yt_dlp, uuid, os, subprocess, tempfile

app = Flask(__name__)

DOWNLOAD_DIR = "/tmp/downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

def download_media(url: str, fmt: str) -> str:
    video_id = str(uuid.uuid4())
    outfile = os.path.join(DOWNLOAD_DIR, f"{video_id}.%(ext)s")

    ydl_opts = {"outtmpl": outfile, "quiet": True}
    if fmt == "mp3":
        ydl_opts.update({
            "format": "bestaudio",
            "extractaudio": True,
            "audioformat": "mp3",
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }],
        })
    else:  # mp4
        ydl_opts["format"] = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best"

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

    # gerçek dosya adını yakala
    final_path = ydl.prepare_filename(info)
    if fmt == "mp3":
        final_path = os.path.splitext(final_path)[0] + ".mp3"
    return final_path

@app.route("/download", methods=["POST"])
def download_endpoint():
    data = request.get_json(silent=True) or {}
    url = data.get("url", "")
    fmt = data.get("format", "mp4")
    if not url or fmt not in ("mp4", "mp3"):
        return jsonify({"error": "Geçersiz istek"}), 400

    try:
        file_path = download_media(url, fmt)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    @after_this_request
    def cleanup(response):
        try:
            os.remove(file_path)
        except OSError:
            pass
        return response

    return send_file(file_path, as_attachment=True)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
