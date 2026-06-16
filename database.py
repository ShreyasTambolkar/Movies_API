import psycopg2
import psycopg2.extras
import hashlib
import os
from dotenv import load_dotenv
load_dotenv()

def get_connection():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    return conn

def row_to_dict(cursor, row):
    columns = [desc[0] for desc in cursor.description]
    return dict(zip(columns, row))

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def init_db():
    conn   = get_connection()
    cursor = conn.cursor()

    cursor.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS movies (
            movie_id     SERIAL PRIMARY KEY,
            title        TEXT,
            director     TEXT,
            genre        TEXT,
            release_year INTEGER,
            rating       REAL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id       SERIAL PRIMARY KEY,
            email    TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')

    cursor.execute("SELECT COUNT(*) FROM movies")
    if cursor.fetchone()[0] == 0:
        sample_movies = [
            ("Inception",        "Christopher Nolan",    "Sci-Fi", 2010, 8.8),
            ("The Godfather",    "Francis Ford Coppola", "Crime",  1972, 9.2),
            ("The Dark Knight",  "Christopher Nolan",    "Action", 2008, 9.0),
            ("Interstellar",     "Christopher Nolan",    "Sci-Fi", 2014, 8.6),
            ("Pulp Fiction",     "Quentin Tarantino",    "Crime",  1994, 8.9),
            ("Forrest Gump",     "Robert Zemeckis",      "Drama",  1994, 8.8),
            ("3 Idiots",         "Rajkumar Hirani",      "Comedy", 2009, 8.4),
            ("Dangal",           "Nitesh Tiwari",        "Drama",  2016, 8.3),
            ("KGF Chapter 2",    "Prashanth Neel",       "Action", 2022, 8.2),
            ("Avengers Endgame", "Anthony Russo",        "Action", 2019, 8.4),
        ]
        cursor.executemany('''
            INSERT INTO movies (title, director, genre, release_year, rating)
            VALUES (%s, %s, %s, %s, %s)
        ''', sample_movies)
        print("Sample movies inserted!")

    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        sample_users = [
            ("alice@movies.com",   hash_password("Alice@123")),
            ("bob@movies.com",     hash_password("Bob@456")),
            ("charlie@movies.com", hash_password("Charlie@789")),
        ]
        cursor.executemany('''
            INSERT INTO users (email, password) VALUES (%s, %s)
        ''', sample_users)
        print("Sample users inserted!")

    conn.commit()
    cursor.close()
    conn.close()
    print("Database ready!")