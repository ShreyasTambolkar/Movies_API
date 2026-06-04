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

    return jsonify(movies)


# ─── GET ONE MOVIE ───────────────────────────────────────────────
@app.route("/movies/<int:id>", methods=["GET"])
def get_one_movie(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM movies WHERE movie_id = ?", (id,))
    row = cursor.fetchone()

    conn.close()

    return jsonify(dict(row))


# ─── ADD NEW MOVIE ───────────────────────────────────────────────
@app.route("/movies", methods=["POST"])
def add_movie():
    data = request.get_json()

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO movies (title, director, genre, release_year, rating)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        data["title"],
        data["director"],
        data["genre"],
        data["release_year"],
        data["rating"]
    ))

    conn.commit()
    conn.close()

    return jsonify({"message": "Movie added successfully!"})


# ─── UPDATE MOVIE ────────────────────────────────────────────────
@app.route("/movies/<int:id>", methods=["PUT"])
def update_movie(id):
    data = request.get_json()

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE movies
        SET title        = ?,
            director     = ?,
            genre        = ?,
            release_year = ?,
            rating       = ?
        WHERE movie_id = ?
    ''', (
        data["title"],
        data["director"],
        data["genre"],
        data["release_year"],
        data["rating"],
        id
    ))

    conn.commit()
    conn.close()

    return jsonify({"message": "Movie updated successfully!"})


# ─── DELETE MOVIE ────────────────────────────────────────────────
@app.route("/movies/<int:id>", methods=["DELETE"])
def delete_movie(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM movies WHERE movie_id = ?", (id,))

    conn.commit()
    conn.close()

    return jsonify({"message": "Movie deleted successfully!"})


# ─── START THE APP ───────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)