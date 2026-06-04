import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS movies (
            movie_id     INT AUTO_INCREMENT PRIMARY KEY,
            title        VARCHAR(100),
            director     VARCHAR(100),
            genre        VARCHAR(50),
            release_year INT,
            rating       DECIMAL(2,1)
        )
    ''')

    conn.commit()
    cursor.close()
    conn.close()
    print("Database is ready!")