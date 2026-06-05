import sqlite3

DATABASE = "movies.db"

def get_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS movies (
            movie_id     INTEGER PRIMARY KEY,
            title        TEXT,
            director     TEXT,
            genre        TEXT,
            release_year INTEGER,
            rating       REAL
        )
    ''')

    # Insert sample data only if table is empty
    cursor.execute("SELECT COUNT(*) FROM movies")
    count = cursor.fetchone()[0]

    if count == 0:
        sample_movies = [
            (1,  "Inception",                "Christopher Nolan",    "Sci-Fi",  2010, 8.8),
            (2,  "The Godfather",            "Francis Ford Coppola", "Crime",   1972, 9.2),
            (3,  "The Dark Knight",          "Christopher Nolan",    "Action",  2008, 9.0),
            (4,  "Interstellar",             "Christopher Nolan",    "Sci-Fi",  2014, 8.6),
            (5,  "Pulp Fiction",             "Quentin Tarantino",    "Crime",   1994, 8.9),
            (6,  "Forrest Gump",             "Robert Zemeckis",      "Drama",   1994, 8.8),
            (7,  "3 Idiots",                 "Rajkumar Hirani",      "Comedy",  2009, 8.4),
            (8,  "Dangal",                   "Nitesh Tiwari",        "Drama",   2016, 8.3),
            (9,  "KGF Chapter 2",            "Prashanth Neel",       "Action",  2022, 8.2),
            (10, "Avengers Endgame",         "Anthony Russo",        "Action",  2019, 8.4),
        ]
        cursor.executemany('''
            INSERT INTO movies (movie_id, title, director, genre, release_year, rating)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', sample_movies)
        print("Sample data inserted!")

    conn.commit()
    conn.close()
    print("Database is ready!")