
import os
import json
import sqlite3
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Lade Umgebungsvariablen
load_dotenv()

app = Flask(__name__)

# Maximale CORS-Freigabe
CORS(app, resources={r"/api/*": {
    "origins": "*", 
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "Accept", "X-Requested-With"]
}})

# Konfiguration
BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"
BREVO_SENDER_NAME = os.getenv("BREVO_SENDER_NAME", "MieterMatch")
BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL", "no-reply@propertymind.online")
DATABASE = 'mietermatch.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS landlords (
            id TEXT PRIMARY KEY, address TEXT, sqm REAL, rooms REAL, floor TEXT,
            gardenOrBalcony TEXT, parkingDetails TEXT, kitchenDetails TEXT, buildingAge TEXT,
            rentCold REAL, serviceCharges REAL, parkingRent REAL, otherCosts REAL,
            rentWarm REAL, zipCode TEXT, email TEXT, phone TEXT, propertyTitle TEXT,
            status TEXT, createdAt TEXT, images TEXT, isVerified INTEGER DEFAULT 0
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS tenants (
            id TEXT PRIMARY KEY, desiredLocation TEXT, minSqm REAL, minRooms REAL,
            preferredFloor TEXT, gardenOrBalcony TEXT, parkingNeeded TEXT, kitchenIncluded TEXT,
            buildingCondition TEXT, maxRent REAL, householdIncome REAL, incomeType TEXT,
            incomeDetails TEXT, email TEXT, phone TEXT, personalIntro TEXT,
            profileImage TEXT, status TEXT, createdAt TEXT, isVerified INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/api/system-status', methods=['GET'])
def system_status():
    db_file_exists = os.path.exists(DATABASE)
    return jsonify({
        "database": {"online": True, "file_exists": db_file_exists},
        "brevo": {"active": bool(BREVO_API_KEY)}
    })

@app.route('/api/landlords', methods=['GET'])
def get_landlords():
    conn = get_db_connection()
    rows = conn.execute('SELECT * FROM landlords').fetchall()
    conn.close()
    result = [dict(row) for row in rows]
    for d in result:
        d['isVerified'] = bool(d['isVerified'])
        if d['images']: d['images'] = json.loads(d['images'])
    return jsonify(result)

@app.route('/api/landlords', methods=['POST'])
def save_landlord():
    data = request.json
    conn = get_db_connection()
    conn.execute('''
        INSERT OR REPLACE INTO landlords 
        (id, address, sqm, rooms, floor, gardenOrBalcony, parkingDetails, kitchenDetails, buildingAge, 
         rentCold, serviceCharges, parkingRent, otherCosts, rentWarm, zipCode, email, phone, propertyTitle, status, createdAt, images, isVerified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get('id'), data.get('address'), data.get('sqm'), data.get('rooms'), data.get('floor'),
        data.get('gardenOrBalcony'), data.get('parkingDetails'), data.get('kitchenDetails'), data.get('buildingAge'),
        data.get('rentCold'), data.get('serviceCharges'), data.get('parkingRent'), data.get('otherCosts'),
        data.get('rentWarm'), data.get('zipCode'), data.get('email'), data.get('phone'),
        data.get('propertyTitle'), data.get('status'), data.get('createdAt'),
        json.dumps(data.get('images', [])), 1 if data.get('isVerified') else 0
    ))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/tenants', methods=['GET'])
def get_tenants():
    conn = get_db_connection()
    rows = conn.execute('SELECT * FROM tenants').fetchall()
    conn.close()
    result = [dict(row) for row in rows]
    for d in result: d['isVerified'] = bool(d['isVerified'])
    return jsonify(result)

@app.route('/api/tenants', methods=['POST'])
def save_tenant():
    data = request.json
    conn = get_db_connection()
    conn.execute('''
        INSERT OR REPLACE INTO tenants 
        (id, desiredLocation, minSqm, minRooms, preferredFloor, gardenOrBalcony, parkingNeeded, kitchenIncluded, 
         buildingCondition, maxRent, householdIncome, incomeType, incomeDetails, email, phone, personalIntro, profileImage, status, createdAt, isVerified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get('id'), data.get('desiredLocation'), data.get('minSqm'), data.get('minRooms'),
        data.get('preferredFloor'), data.get('gardenOrBalcony'), data.get('parkingNeeded'),
        data.get('kitchenIncluded'), data.get('buildingCondition'), data.get('maxRent'),
        data.get('householdIncome'), data.get('incomeType'), data.get('incomeDetails'),
        data.get('email'), data.get('phone'), data.get('personalIntro'),
        data.get('profileImage'), data.get('status'), data.get('createdAt'),
        1 if data.get('isVerified') else 0
    ))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/send-verification', methods=['POST'])
def send_verification():
    data = request.json
    email = data.get('email')
    code = data.get('code')
    if not BREVO_API_KEY:
        return jsonify({"success": True, "details": "Demo-Modus"})
    payload = {
        "sender": {"name": BREVO_SENDER_NAME, "email": BREVO_SENDER_EMAIL},
        "to": [{"email": email}],
        "subject": "Dein Verifizierungscode",
        "htmlContent": f"<h1>{code}</h1>"
    }
    headers = {"api-key": BREVO_API_KEY, "content-type": "application/json"}
    requests.post(BREVO_API_URL, headers=headers, json=payload)
    return jsonify({"success": True})

@app.route('/api/send-offer', methods=['POST'])
def send_offer():
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
