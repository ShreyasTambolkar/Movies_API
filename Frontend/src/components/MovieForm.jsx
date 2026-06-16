const GENRES = [
  "Action",
  "Comedy",
  "Crime",
  "Drama",
  "Horror",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Animation",
  "Documentary",
  "Fantasy",
  "Mystery",
];

export default function MovieForm({ form, errors, message, error, onChange, onSubmit }) {
  return (
    <div className="form">
      <h2>Add a Movie</h2>
      <div className="form-row">

        <div className="field">
          <input
            name="movie_id"
            placeholder="ID"
            value={form.movie_id}
            onChange={onChange}
            className={errors.movie_id ? "input-error" : ""}
          />
          {errors.movie_id && <span className="field-error">{errors.movie_id}</span>}
        </div>

        <div className="field">
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={onChange}
            className={errors.title ? "input-error" : ""}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

        <div className="field">
          <select
            name="genre"
            value={form.genre}
            onChange={onChange}
            className={errors.genre ? "input-error" : ""}
            style={{
              padding: "8px 12px", borderRadius: "8px", border: "1px solid #30363d",
              backgroundColor: "white", color: form.genre === "" ? "#8b949e" : "black",
              fontSize: "14px", width: "100%", outline: "none", cursor: "pointer",
            }}
          >
            <option value="" disabled>Select Genre</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          {errors.genre && <span className="field-error">{errors.genre}</span>}
        </div>

        <div className="field">
          <input
            name="director"
            placeholder="Director"
            value={form.director}
            onChange={onChange}
            className={errors.director ? "input-error" : ""}
          />
          {errors.director && <span className="field-error">{errors.director}</span>}
        </div>

        <div className="field">
          <input
            name="release_year"
            placeholder="Release Year (1950-2026)"
            value={form.release_year}
            onChange={onChange}
            className={errors.release_year ? "input-error" : ""}
          />
          {errors.release_year && <span className="field-error">{errors.release_year}</span>}
        </div>

        <div className="field">
          <input
            name="rating"
            placeholder="Rating (1-10)"
            value={form.rating}
            onChange={onChange}
            className={errors.rating ? "input-error" : ""}
          />
          {errors.rating && <span className="field-error">{errors.rating}</span>}
        </div>

      </div>
      <button onClick={onSubmit}>Add Movie</button>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}