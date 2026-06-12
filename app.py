from flask import Flask, jsonify, request
from database import get_connection, init_db
from flask_cors import CORS
import hashlib
import os
import re

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def row_to_dict(cursor, row):
    columns = [desc[0] for desc in cursor.description]
    return dict(zip(columns, row))

@app.route("/movies", methods=["GET"])
def get_all_movies():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM movies")
    rows = cursor.fetchall()
    movies = [row_to_dict(cursor, row) for row in rows]
    conn.close()
    if not movies:
        return jsonify({"message": "No movies found!"}), 404
    return jsonify(movies)

@app.route("/movies/sorted", methods=["GET"])
def get_movies_sorted():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM movies ORDER BY rating DESC")
    rows = cursor.fetchall()
    movies = [row_to_dict(cursor, row) for row in rows]
    conn.close()
    if not movies:
        return jsonify({"message": "No movies found!"}), 404
    return jsonify(movies)

# ✅ Chart route MUST be before /movies/<int:id> to avoid being caught by it
@app.route("/movies/chart/by-genre", methods=["GET"])
def movies_chart_by_genre():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT genre FROM movies")
    rows = cursor.fetchall()
    conn.close()

    genre_counts = {}
    for row in rows:
        genre = row[0]
        genre_counts[genre] = genre_counts.get(genre, 0) + 1

    sorted_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)

    return jsonify({
        "categories": [g[0] for g in sorted_genres],
        "series": [{"name": "Movies", "data": [g[1] for g in sorted_genres]}]
    })

@app.route("/movies/<int:id>", methods=["GET"])
def get_one_movie(id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM movies WHERE movie_id = %s", (id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return jsonify({"message": f"Movie with ID {id} does not exist!"}), 404
    return jsonify(row_to_dict(cursor, row))

@app.route("/movies", methods=["POST"])
def add_movie():
    data = request.get_json()
    required_fields = ["title", "director", "genre", "release_year", "rating"]
    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({"message": f"Missing fields: {', '.join(missing)}"}), 400
    if not (1 <= data["rating"] <= 10):
        return jsonify({"message": "Rating must be between 1 and 10!"}), 400
    if data["release_year"] < 1950 or data["release_year"] > 2026:
        return jsonify({"message": "Please enter a valid release year!"}), 400
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM movies WHERE title = %s AND director = %s",
        (data["title"], data["director"]))
    if cursor.fetchone():
        conn.close()
        return jsonify({"message": "This movie already exists!"}), 409
    cursor.execute('''
        INSERT INTO movies (title, director, genre, release_year, rating)
        VALUES (%s, %s, %s, %s, %s)
    ''', (data["title"], data["director"], data["genre"], data["release_year"], data["rating"]))
    conn.commit()
    conn.close()
    return jsonify({"message": "Movie added successfully!"})

@app.route("/movies/<int:id>", methods=["PUT"])
def update_movie(id):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM movies WHERE movie_id = %s", (id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return jsonify({"message": f"Movie with ID {id} does not exist!"}), 404
    if "rating" in data and not (1 <= data["rating"] <= 10):
        conn.close()
        return jsonify({"message": "Rating must be between 1 and 10!"}), 400
    if "release_year" in data and (data["release_year"] < 1950 or data["release_year"] > 2026):
        conn.close()
        return jsonify({"message": "Please enter a valid release year!"}), 400
    allowed_fields = ["title", "director", "genre", "release_year", "rating"]
    updates = {key: value for key, value in data.items() if key in allowed_fields}
    if not updates:
        conn.close()
        return jsonify({"message": "No valid fields to update!"}), 400
    for field, value in updates.items():
        cursor.execute(f"UPDATE movies SET {field} = %s WHERE movie_id = %s", (value, id))
    conn.commit()
    conn.close()
    return jsonify({"message": f"Movie with ID {id} updated successfully!"})

@app.route("/movies/<int:id>", methods=["DELETE"])
def delete_movie(id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM movies WHERE movie_id = %s", (id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"message": f"Movie with ID {id} does not exist!"}), 404
    cursor.execute("DELETE FROM movies WHERE movie_id = %s", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": f"Movie with ID {id} deleted successfully!"})

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()
    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Email not found."}), 401
    user = row_to_dict(cursor, row)
    if user["password"] != hash_password(password):
        return jsonify({"error": "Incorrect password."}), 401
    return jsonify({"message": "Login successful.", "user": {"id": user["id"], "email": user["email"]}}), 200

@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email", "").strip()
    if not email:
        return jsonify({"error": "Email is required."}), 400
    return jsonify({"message": "If that email is registered, a reset link has been sent."}), 200

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()
    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400
    if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
        return jsonify({"error": "Please enter a valid email address."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "Email already registered."}), 409
    cursor.execute("INSERT INTO users (email, password) VALUES (%s, %s)",
        (email, hash_password(password)))
    conn.commit()
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    row = cursor.fetchone()
    new_user = row_to_dict(cursor, row)
    conn.close()
    return jsonify({"message": "Account created successfully!", "user": {"id": new_user["id"], "email": new_user["email"]}}), 201

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)