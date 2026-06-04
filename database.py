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
            movie_id     INTEGER PRIMARY KEY AUTOINCREMENT,
            title        TEXT,
            director     TEXT,
            genre        TEXT,
            release_year INTEGER,
            rating       REAL
        )
    ''')

    conn.commit()
    conn.close()
    print("Database is ready!")