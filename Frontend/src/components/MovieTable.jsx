import { useState, useEffect } from "react";
import { movieService } from "../services/api";

const LIMIT = 6;

const SORT_OPTIONS = [
  { label: "ID (Default)",      value: "movie_id",     order: "asc"  },
  { label: "Title A → Z",       value: "title",        order: "asc"  },
  { label: "Title Z → A",       value: "title",        order: "desc" },
  { label: "Rating High → Low", value: "rating",       order: "desc" },
  { label: "Rating Low → High", value: "rating",       order: "asc"  },
  { label: "Year Newest",       value: "release_year", order: "desc" },
  { label: "Year Oldest",       value: "release_year", order: "asc"  },
];

export default function MovieTable({ onDataChange }) {
  const [movies,      setMovies]      = useState([]);
  const [pagination,  setPagination]  = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [error,       setError]       = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  const [search,    setSearch]    = useState(""); 
  const [sortIndex, setSortIndex] = useState(0);

  const [editId,     setEditId]     = useState(null);
  const [editForm,   setEditForm]   = useState({
    title: "", genre: "", director: "", release_year: "", rating: "",
  });
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    fetchPaginatedMovies(currentPage);
  }, [currentPage, search, sortIndex]);

  const fetchPaginatedMovies = (page = 1) => {
    const { value: sort_by, order: sort_order } = SORT_OPTIONS[sortIndex];
    movieService
      .getPaginatedMovies({ page, limit: LIMIT, search, sort_by, sort_order })
      .then((res) => {
        setMovies(res.data);
        setPagination(res.pagination);
        setError("");
      })
      .catch(() => setError("Failed to fetch movies."));
  };


  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearch("");
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortIndex(Number(e.target.value));
    setCurrentPage(1);
  };


  const validateEdit = () => {
    const newErrors = {};
    if (editForm.title !== undefined && editForm.title.trim() === "")
      newErrors.title = "Title cannot be empty.";
    if (editForm.genre !== undefined && editForm.genre.trim() === "")
      newErrors.genre = "Genre cannot be empty.";
    if (editForm.director !== undefined && editForm.director.trim() === "")
      newErrors.director = "Director cannot be empty.";
    if (editForm.release_year !== undefined && editForm.release_year !== "") {
      if (isNaN(editForm.release_year) || parseInt(editForm.release_year) < 1950 || parseInt(editForm.release_year) > 2026)
        newErrors.release_year = "Year must be between 1950 and 2026.";
    }
    if (editForm.rating !== undefined && editForm.rating !== "") {
      if (isNaN(editForm.rating) || parseFloat(editForm.rating) < 1 || parseFloat(editForm.rating) > 10)
        newErrors.rating = "Rating must be between 1 and 10.";
    }
    return newErrors;
  };

  const handleEditClick = (movie) => {
    setEditId(movie.movie_id);
    setEditForm({
      title: movie.title, genre: movie.genre, director: movie.director,
      release_year: movie.release_year, rating: movie.rating,
    });
    setEditErrors({});
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
    setEditErrors({ ...editErrors, [e.target.name]: "" });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditErrors({});
  };

  const handleEditSubmit = (movie_id) => {
    const validationErrors = validateEdit();
    if (Object.keys(validationErrors).length > 0) { setEditErrors(validationErrors); return; }
    const payload = {
      title: editForm.title, genre: editForm.genre, director: editForm.director,
      release_year: parseInt(editForm.release_year), rating: parseFloat(editForm.rating),
    };
    movieService.updateMovie(movie_id, payload)
      .then(() => {
        setEditId(null);
        fetchPaginatedMovies(currentPage);
        if (onDataChange) onDataChange();
      })
      .catch(() => setError("Failed to update movie."));
  };

const handleDelete = (movie_id) => {
  movieService.deleteMovie(movie_id)
    .then(() => {
      const isLastItemOnPage = movies.length === 1 && currentPage > 1;
      const newPage = isLastItemOnPage ? currentPage - 1 : currentPage;
      setDeleteMessage("Movie deleted successfully!");
      setTimeout(() => setDeleteMessage(""), 3000);
      if (isLastItemOnPage) {
        setCurrentPage(newPage); 
      } else {
        fetchPaginatedMovies(newPage); 
      }
      if (onDataChange) onDataChange();
    })
    .catch(() => setError("Failed to delete movie."));
};

  return (
    <div className="home-page">
      <h1 className="home-title">Movies</h1>


      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px", marginBottom: "16px",
      }}>


        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontWeight: 600, color: "#c9d1d9", whiteSpace: "nowrap", color:"black" }}>
            Sort by:
          </label>
          <select
            value={sortIndex}
            onChange={handleSortChange}
            style={{
              padding: "8px 12px", borderRadius: "8px", border: "1px solid #30363d",
              backgroundColor: "white", color: "black", cursor: "pointer",
              fontSize: "14px", outline: "none",
            }}
          >
            {SORT_OPTIONS.map((opt, i) => (
              <option key={i} value={i}>{opt.label}</option>
            ))}
          </select>
        </div>

      
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search title, director, genre..."
            value={search}
            onChange={handleSearchChange}
            style={{
              padding: "8px 36px 8px 12px", borderRadius: "8px",
              border: "1px solid #30363d", backgroundColor: "white",
              color: "black", fontSize: "14px", width: "260px", outline: "none",
            }}
          />
          {search && (
            <span
              onClick={handleClearSearch}
              style={{
                position: "absolute", right: "10px", top: "50%",
                transform: "translateY(-50%)", cursor: "pointer",
                color: "#8b949e", fontSize: "18px", lineHeight: 1,
              }}
            >
              ×
            </span>
          )}
        </div>
      </div>

      {/* Active search badge */}
      {search && (
        <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#8b949e", fontSize: "13px" }}>Showing results for:</span>
          <span style={{
            backgroundColor: "#21262d", border: "1px solid #30363d",
            borderRadius: "20px", padding: "2px 10px",
            fontSize: "13px", color: "#e2b714", fontWeight: 600,
          }}>
            {search}
          </span>
          <span
            onClick={handleClearSearch}
            style={{ color: "#8b949e", fontSize: "12px", cursor: "pointer", textDecoration: "underline" }}
          >
            clear
          </span>
        </div>
      )}

      {deleteMessage && <p className="success">{deleteMessage}</p>}
          
      {error && <p className="error">{error}</p>}

  
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Title</th><th>Genre</th>
            <th>Director</th><th>Release Year</th><th>Rating</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.length === 0 ? (
            <tr><td colSpan="7">No movies found</td></tr>
          ) : (
            movies.map((movie) =>
              editId === movie.movie_id ? (
                <tr key={movie.movie_id} className="edit-row">
                  <td>{movie.movie_id}</td>
                  <td>
                    <input name="title" value={editForm.title} onChange={handleEditChange}
                      className={editErrors.title ? "input-error" : ""} />
                    {editErrors.title && <span className="field-error">{editErrors.title}</span>}
                  </td>
                  <td>
                    <input name="genre" value={editForm.genre} onChange={handleEditChange}
                      className={editErrors.genre ? "input-error" : ""} />
                    {editErrors.genre && <span className="field-error">{editErrors.genre}</span>}
                  </td>
                  <td>
                    <input name="director" value={editForm.director} onChange={handleEditChange}
                      className={editErrors.director ? "input-error" : ""} />
                    {editErrors.director && <span className="field-error">{editErrors.director}</span>}
                  </td>
                  <td>
                    <input name="release_year" value={editForm.release_year} onChange={handleEditChange}
                      className={editErrors.release_year ? "input-error" : ""} />
                    {editErrors.release_year && <span className="field-error">{editErrors.release_year}</span>}
                  </td>
                  <td>
                    <input name="rating" value={editForm.rating} onChange={handleEditChange}
                      className={editErrors.rating ? "input-error" : ""} />
                    {editErrors.rating && <span className="field-error">{editErrors.rating}</span>}
                  </td>
                  <td>
                    <button className="save-btn" onClick={() => handleEditSubmit(movie.movie_id)}>Save</button>
                    <button className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={movie.movie_id}>
                  <td>{movie.movie_id}</td>
                  <td>{movie.title}</td>
                  <td>{movie.genre}</td>
                  <td>{movie.director}</td>
                  <td>{movie.release_year}</td>
                  <td>{movie.rating}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEditClick(movie)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(movie.movie_id)}>Delete</button>
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>


      {pagination.totalPages > 0 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "20px", flexWrap: "wrap", gap: "12px",
        }}>
          <p className="home-subtitle" style={{ marginBottom: 0 }}>
            Page <strong>{pagination.currentPage}</strong> of{" "}
            <strong>{pagination.totalPages}</strong> —{" "}
            <strong>{pagination.totalRecords}</strong> total movies
          </p>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                style={{
                  backgroundColor: p === pagination.currentPage ? "#3730a3" : "#4f46e5",
                  outline: p === pagination.currentPage ? "2px solid #e2b714" : "none",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}