# movies_pagination.py
from flask import Blueprint, request, jsonify
from database import get_connection, row_to_dict
import math

movies_bp = Blueprint("movies", __name__)

SORTABLE_COLUMNS   = {"movie_id", "title", "genre", "director", "release_year", "rating"}
SEARCHABLE_COLUMNS = ["title", "director", "genre"]

@movies_bp.route("/movies/paginated", methods=["GET"])
def get_paginated_movies():

   
    try:
        page  = max(1, int(request.args.get("page",  1)))
        limit = min(100, max(1, int(request.args.get("limit", 10))))
    except ValueError:
        return jsonify({"success": False, "message": "page and limit must be integers"}), 400

    
    sort_by    = request.args.get("sort_by",    "movie_id").lower()
    sort_order = request.args.get("sort_order", "asc").lower()

    if sort_by not in SORTABLE_COLUMNS:
        return jsonify({
            "success": False,
            "message": f"sort_by must be one of: {', '.join(sorted(SORTABLE_COLUMNS))}"
        }), 400

    if sort_order not in ("asc", "desc"):
        return jsonify({
            "success": False,
            "message": "sort_order must be 'asc' or 'desc'"
        }), 400

   
    search    = request.args.get("search", "").strip()
    threshold = 0.3

 
    conn   = get_connection()
    cursor = conn.cursor()

    if search:
        similarity_expr  = " + ".join(f"similarity({col}, %s)" for col in SEARCHABLE_COLUMNS)
        ilike_conditions = " OR ".join(f"{col} ILIKE %s"       for col in SEARCHABLE_COLUMNS)

        where_clause = f"""
            WHERE (
                ({similarity_expr}) >= %s
                OR {ilike_conditions}
            )
        """
        sim_params    = [search] * len(SEARCHABLE_COLUMNS)
        ilike_params  = [f"{search}%"] * len(SEARCHABLE_COLUMNS)  
        search_params = sim_params + [threshold] + ilike_params


        order_clause = f"({similarity_expr}) DESC, {sort_by} {sort_order.upper()}"
        order_params = [search] * len(SEARCHABLE_COLUMNS)

    else:
        where_clause  = ""
        search_params = []
        order_clause  = f"{sort_by} {sort_order.upper()}"
        order_params  = []


    cursor.execute(
        f"SELECT COUNT(*) FROM movies {where_clause}",
        search_params
    )
    total       = cursor.fetchone()[0]
    total_pages = math.ceil(total / limit) if total > 0 else 1
    skip        = (page - 1) * limit


    cursor.execute(
        f"""
        SELECT * FROM movies
        {where_clause}
        ORDER BY {order_clause}
        LIMIT %s OFFSET %s
        """,
        search_params + order_params + [limit, skip]
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
        "filters": {
            "search"    : search or None,
            "sort_by"   : sort_by,
            "sort_order": sort_order,
        },
        "data": movies
    })