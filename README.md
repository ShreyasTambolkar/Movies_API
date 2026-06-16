# Movies API

A simple REST API built with Python and Flask that supports full CRUD functionality for a Movies database using SQLite.

---

## Live API

Base URL: `https://movies-api-n9r5.onrender.com`

---

## Tech Stack

- **Language:** Python
- **Framework:** Flask
- **Database:** SQLite
- **Deployed on:** Render

---

## Project Structure

```
movies_api/
├── app.py                  ← All API routes
├── database.py             ← Database connection and table setup
├── requirements.txt        ← Python libraries needed
├── validation_notes.txt    ← Notes on validations added
├── .gitignore              ← Files ignored by Git
└── README.md               ← Project documentation
```

---

## Setup and Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/movies-api.git
cd movies-api
```

**2. Install required libraries**
```bash
pip install flask
```

**3. Run the API locally**
```bash
python app.py
```

The API will start at `http://127.0.0.1:5000`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/movies` | Get all movies |
| GET | `/movies/sorted` | Get all movies sorted by rating |
| GET | `/movies/<id>` | Get one movie by ID |
| POST | `/movies` | Add a new movie |
| PUT | `/movies/<id>` | Update a movie |
| DELETE | `/movies/<id>` | Delete a movie |

---

## Live API Examples

| Method | URL |
|---|---|
| GET all | `https://movies-api-n9r5.onrender.com/movies` |
| GET sorted | `https://movies-api-n9r5.onrender.com/movies/sorted` |
| GET one | `https://movies-api-n9r5.onrender.com/movies/1` |
| POST | `https://movies-api-n9r5.onrender.com/movies` |
| PUT | `https://movies-api-n9r5.onrender.com/movies/1` |
| DELETE | `https://movies-api-n9r5.onrender.com/movies/1` |

---

## Request Body

For **POST** and **PUT** requests, send JSON in this format:

```json
{
  "movie_id": 1,
  "title": "Inception",
  "director": "Christopher Nolan",
  "genre": "Sci-Fi",
  "release_year": 2010,
  "rating": 8.8
}
```

For **PUT**, you can send only the fields you want to update:

```json
{
  "rating": 9.0
}
```

---

## Validations

- Missing fields are flagged with a clear error message
- Rating must be between 1 and 10
- Release year must be between 1888 and 2100
- Duplicate movie ID is rejected
- Duplicate title and director combination is rejected
- Non-existent ID returns a proper 404 message for GET, PUT and DELETE

---

## Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad request — missing or invalid data |
| 404 | Not found — ID does not exist |
| 409 | Conflict — duplicate data |