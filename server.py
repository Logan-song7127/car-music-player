import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

app=Flask('Spotify2')
CORS(app)

PC_IP="192.168.1.73"

BASE_DIR=os.path.dirname(os.path.abspath(__file__))
MUSIC_DIR=os.path.join(BASE_DIR, "music")

@app.route('/', methods=['GET'])
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/<path:filename>', methods=['GET'])
def serve_static(filename):
    return send_from_directory(BASE_DIR, filename)

@app.route('/api/playlist', methods=['GET'])
def get_playlist():
	playlist=[]
	if not os.path.exists(MUSIC_DIR):
		return jsonify({"error": f"Music folder not found at {MUSIC_DIR}"}), 404
	
	for filename in os.listdir(MUSIC_DIR):
		if filename.lower().endswith('.mp3'):
			name_without_ext=os.path.splitext(filename)[0]
			
			if " - " in name_without_ext:
				artist, title=name_without_ext.split(" - ", 1)
			else:
				artist, title="Local Artist", name_without_ext
			playlist.append({
				"title": title.strip(),
				"artist": artist.strip(),
				"url": f"http://{PC_IP}:5000/music/{filename}"
			})

	return jsonify({"tracks": playlist})

@app.route('/music/<filename>', methods=['GET'])
def stream_music(filename):
	return send_from_directory(MUSIC_DIR, filename)


if __name__=='__main__':
	print(f"\n[SERVER RUNNING] Streaming to app config at http://{PC_IP}:5000\n")
	app.run(host='0.0.0.0', port=5000, debug=True)