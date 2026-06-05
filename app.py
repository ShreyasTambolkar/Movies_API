from flask import Flask, jsonify, request
from database import get_connection, init_db

app = Flask(__name__)


# ─── GET ALL MOVIES ──────────────────────────────────────────────
@app.route("/movies", methods=["GET"])
def get_all_movies():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM movies")
    rows = cursor.fetchall()

    conn.close()

    movies = [dict(row) for row in rows]

    if not movies:
        return jsonify({"message": "No movies found in the database!"}), 404

    return jsonify(movies)


# ─── GET ALL MOVIES SORTED BY RATING ────────────────────────────
@app.route("/movies/sorted", methods=["GET"])
def get_movies_sorted():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM movies ORDER BY rating DESC")
    rows = cursor.fetchall()

    conn.close()

    movies = [dict(row) for row in rows]

    if not movies:
        return jsonify({"message": "No movies found in the database!"}), 404

    return jsonify(movies)


# ─── GET ONE MOVIE ───────────────────────────────────────────────
@app.route("/movies/<int:id>", methods=["GET"])
def get_one_movie(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM movies WHERE movie_id = ?", (id,))
    row = cursor.fetchone()

    conn.close()

    if not row:
        return jsonify({"message": f"Movie with ID {id} does not exist!"}), 404

    return jsonify(dict(row))


# ─── ADD NEW MOVIE ───────────────────────────────────────────────
@app.route("/movies", methods=["POST"])
def add_movie():
    data = request.get_json()

    # check all required fields are present
    required_fields = ["movie_id", "title", "director", "genre", "release_year", "rating"]
    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({"message": f"Missing fields: {', '.join(missing)}"}), 400

    # check rating is between 1 and 10
    if not (1 <= data["rating"] <= 10):
        return jsonify({"message": "Rating must be between 1 and 10!"}), 400

    # check release year is valid
    if data["release_year"] < 1950 or data["release_year"] > 2026:
        return jsonify({"message": "Please enter a valid release year!"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    # check if movie_id already exists
    cursor.execute("SELECT * FROM movies WHERE movie_id = ?", (data["movie_id"],))
    existing_id = cursor.fetchone()

    if existing_id:
        conn.close()
        return jsonify({"message": "A movie with this ID already exists!"}), 409

    # check if title and director already exists
    cursor.execute(
        "SELECT * FROM movies WHERE title = ? AND director = ?",
        (data["title"], data["director"])
    )
    existing_movie = cursor.fetchone()

    if existing_movie:
        conn.close()
        return jsonify({"message": "This movie already exists in the database!"}), 409

    cursor.execute('''
        INSERT INTO movies (movie_id, title, director, genre, release_year, rating)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        data["movie_id"],
        data["title"],
        data["director"],
        data["genre"],
        data["release_year"],
        data["rating"]
    ))

    conn.commit()
    conn.close()

    return jsonify({"message": "Movie added successfully!"})


# ─── UPDATE MOVIE (only fields you send will be updated) ─────────
@app.route("/movies/<int:id>", methods=["PUT"])
def update_movie(id):
    data = request.get_json()

    # check if movie exists first
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM movies WHERE movie_id = ?", (id,))
    existing = cursor.fetchone()

    if not existing:
        conn.close()
        return jsonify({"message": f"Movie with ID {id} does not exist!"}), 404

    # check rating is between 1 and 10 if it is being updated
    if "rating" in data and not (1 <= data["rating"] <= 10):
        conn.close()
        return jsonify({"message": "Rating must be between 1 and 10!"}), 400

    # check release year is valid if it is being updated
    if "release_year" in data and (data["release_year"] < 1888 or data["release_year"] > 2100):
        conn.close()
        return jsonify({"message": "Please enter a valid release year!"}), 400

    allowed_fields = ["title", "director", "genre", "release_year", "rating"]
    updates = {key: value for key, value in data.items() if key in allowed_fields}

    if not updates:
        conn.close()
        return jsonify({"message": "No valid fields provided to update!"}), 400

    for field, value in updates.items():
        cursor.execute(
            f"UPDATE movies SET {field} = ? WHERE movie_id = ?",
            (value, id)
        )

    conn.commit()
    conn.close()

    return jsonify({"message": f"Movie with ID {id} updated successfully!"})


# ─── DELETE MOVIE ────────────────────────────────────────────────
@app.route("/movies/<int:id>", methods=["DELETE"])
def delete_movie(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM movies WHERE movie_id = ?", (id,))
    existing = cursor.fetchone()

    if not existing:
        conn.close()
        return jsonify({"message": f"Movie with ID {id} does not exist!"}), 404

    cursor.execute("DELETE FROM movies WHERE movie_id = ?", (id,))

    conn.commit()
    conn.close()

    return jsonify({"message": f"Movie with ID {id} deleted successfully!"})


# ─── START THE APP ───────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000)