## app.py
"""
sqlite3 bookmarks.db
INSERT INTO urls (url, name) VALUES ('https://URL.com/', 'Name');
DELETE FROM urls WHERE url LIKE '%URL.com%';
DELETE FROM urls WHERE name = 'Name';
.exit
"""
import sqlite3
from flask import Flask, request, jsonify, send_file

app = Flask(__name__)

@app.route("/")
def root(): return send_file("index.html")

@app.route("/index.css")
def css(): return send_file("index.css")

@app.route("/index.js")
def js(): return send_file("index.js")

@app.route("/search")
def search():
	q = request.args.get("q", "")
	like_query = f"%{q}%"
	conn = sqlite3.connect("bookmarks.db")
	c = conn.cursor()
	c.execute("""
		SELECT url, name FROM urls
		WHERE url LIKE ? OR name LIKE ?
		ORDER BY url COLLATE NOCASE, name COLLATE NOCASE
	""", (like_query, like_query))
	results = c.fetchall()
	conn.close()
	return jsonify(results)

if __name__ == "__main__": app.run(host='0.0.0.0', port=5050, debug=True)