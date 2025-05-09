import csv
import firebase_admin
from firebase_admin import credentials, firestore

firebase_admin.initialize_app(credentials.Certificate("serviceAccount.json"))
db = firestore.client()

with open("port.csv", newline="") as f:
	reader = csv.reader(f)
	for row in reader:
		url = row[0].strip()
		name = row[1].strip() if len(row) > 1 else ""
		db.collection("bookmarks").add({"url": url, "name": name})