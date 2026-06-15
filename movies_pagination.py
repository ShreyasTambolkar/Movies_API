# movies_pagination.py
from flask import Blueprint, request, jsonify
from database import get_connection, row_to_dict
import math

movies_bp = Blueprint("movies", __name__)

@movies_bp.route("/movies/paginated", methods=["GET"])
def get_paginated_movies():
    try:
        page  = max(1, int(request.args.get("page", 1)))
        limit = min(100, max(1, int(request.args.get("limit", 10))))
    except ValueError:
        return jsonify({"success": False, "message": "page and limit must be integers"}), 400
        
    conn   = get_connection()
    cursor = conn.cursor()

    cursor.execute(f"SELECT COUNT(*) FROM movies")
    total       = cursor.fetchone()[0]
    total_pages = math.ceil(total / limit) if total > 0 else 1
    skip = (page - 1) * limit

    cursor.execute(
        f"SELECT * FROM movies LIMIT %s OFFSET %s",
    [limit, skip]
    )
    rows   = cursor.fetchall()
    movies = [row_to_dict(cursor, row) for row in rows]
    conn.close()

    return jsonify({
        "success": True,
        "pagination": {
            "totalRecords"   : total,
            "totalPages"     : total_pages,
            "currentPage"    : page,
            "perPage"        : limit,
            "hasNextPage"    : page < total_pages,
            "hasPreviousPage": page > 1,
            "nextPage"       : page + 1 if page < total_pages else None,
            "previousPage"   : page - 1 if page > 1 else None,
        },
        "data": movies
    })