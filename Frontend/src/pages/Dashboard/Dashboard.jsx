import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import MovieForm from "../../components/MovieForm";
import MovieTable from "../../components/MovieTable";
import { movieService } from "../../services/api";


function MoviesChart({ movies }) {
  useEffect(() => {
    const dummyData = [
      { genre: "Sci-Fi" },
      { genre: "Sci-Fi" },
      { genre: "Crime" },
      { genre: "Crime" },
      { genre: "Action" },
      { genre: "Action" },
      { genre: "Action" },
      { genre: "Drama" },
      { genre: "Drama" },
      { genre: "Comedy" },
    ];

    const source = dummyData;
    const genres = [...new Set(source.map((m) => m.genre))];
    const counts = genres.map((g) => source.filter((m) => m.genre === g).length);

    import("highcharts").then((Highcharts) => {
      const HC = Highcharts.default ?? Highcharts;
      HC.chart("movies-chart", {
        chart: { type: "column", backgroundColor: "transparent" },
        accessibility: { enabled: false },
        title: { text: "Movies by Genre (Dummy Data)" },
        xAxis: { categories: genres, title: { text: "Genre" } },
        yAxis: { title: { text: "Number of Movies" }, allowDecimals: false },
        series: [{ name: "Movies", color: "#4f46e5", data: counts }],
        credits: { enabled: false },
        legend: { enabled: false },
      });
    });
  }, [movies]);

  return <div id="movies-chart" style={{ width: "100%", height: "400px" }} />;
}


function MoviesChartFromAPI() {
  const [error, setError] = useState("");

  useEffect(() => {
    movieService.getMoviesByGenreChart()
      .then((data) => {
        const { total, ...genres } = data;

        const categories = Object.keys(genres);  
        const counts = Object.values(genres);     

        import("highcharts").then((Highcharts) => {
          const HC = Highcharts.default ?? Highcharts;
          HC.chart("movies-chart-api", {
            chart: { type: "column", backgroundColor: "transparent" },
            accessibility: { enabled: false },
            title: { text: "Movies by Genre (Live from DB)" },
            xAxis: { categories: categories, title: { text: "Genre" } },
            yAxis: { title: { text: "Number of Movies" }, allowDecimals: false },
            series: [{ name: "Movies", color: "#10b981", data: counts }],
            credits: { enabled: false },
            legend: { enabled: false },
          });
        });
      })
      .catch((err) => {
        console.error("Chart fetch failed:", err);
        setError("Failed to load chart data.");
      });
  }, []);

  if (error) return <p style={{ color: "red", padding: "16px" }}>{error}</p>;
  return <div id="movies-chart-api" style={{ width: "100%", height: "400px" }} />;
}


export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("home");
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({
    movie_id: "", title: "", genre: "", director: "", release_year: "", rating: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { fetchMovies(); }, []);

  const fetchMovies = () => {
    movieService.getMovies()
      .then((data) => setMovies(data))
      .catch(() => setError("Failed to fetch movies."));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.movie_id) newErrors.movie_id = "ID is required.";
    if (!form.title.trim()) newErrors.title = "Title is required.";
    if (!form.genre.trim()) newErrors.genre = "Genre is required.";
    if (!form.director.trim()) newErrors.director = "Director is required.";
    if (!form.release_year) {
      newErrors.release_year = "Release year is required.";
    } else if (isNaN(form.release_year) || parseInt(form.release_year) < 1950 || parseInt(form.release_year) > 2026) {
      newErrors.release_year = "Year must be between 1950 and 2026.";
    }
    if (!form.rating) {
      newErrors.rating = "Rating is required.";
    } else if (isNaN(form.rating) || parseFloat(form.rating) < 1 || parseFloat(form.rating) > 10) {
      newErrors.rating = "Rating must be between 1 and 10.";
    }
    return newErrors;
  };

  const handleSubmit = () => {
    setMessage(""); setError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    const payload = {
      movie_id: parseInt(form.movie_id),
      title: form.title, genre: form.genre, director: form.director,
      release_year: parseInt(form.release_year), rating: parseFloat(form.rating),
    };
    movieService.addMovie(payload)
      .then((data) => {
        if (data.message && (data.message.toLowerCase().includes("missing") || data.message.toLowerCase().includes("exists") || data.message.toLowerCase().includes("invalid") || data.message.toLowerCase().includes("must"))) {
          setError(data.message);
        } else {
          setMessage(data.message || "Movie added successfully!");
          setForm({ movie_id: "", title: "", genre: "", director: "", release_year: "", rating: "" });
          setErrors({});
          fetchMovies();
        }
      })
      .catch(() => setError("Failed to add movie."));
  };

  const handleLogout = () => { onLogout(); navigate("/login"); };

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-brand">Movies App</div>
        <nav className="sidebar-nav">
          <button className={activePage === "home" ? "nav-item active" : "nav-item"} onClick={() => setActivePage("home")}>Dashboard</button>
          <button className={activePage === "add" ? "nav-item active" : "nav-item"} onClick={() => setActivePage("add")}>Add Movie</button>
          <button className={activePage === "movies" ? "nav-item active" : "nav-item"} onClick={() => setActivePage("movies")}>Movies</button>
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>Logout</button>
      </div>

      <div className="main-content">
        {activePage === "home" && (
          <div className="home-page">
            <h1 className="home-title">Dashboard</h1>
            <p className="home-subtitle">Hello, {user.email}</p>

            <div className="stats-grid">
              <div className="stat-card">
                <p className="stat-label">Total Movies</p>
                <h2 className="stat-value">{movies.length}</h2>
              </div>
              <div className="stat-card">
                <p className="stat-label">Top Rated</p>
                <h2 className="stat-value">{movies.filter(m => m.rating >= 9).length}</h2>
                <p className="stat-sub">Rating 9 and above</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Directors</p>
                <h2 className="stat-value">{new Set(movies.map(m => m.director)).size}</h2>
                <p className="stat-sub">Unique directors</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Genres</p>
                <h2 className="stat-value">{new Set(movies.map(m => m.genre)).size}</h2>
                <p className="stat-sub">Unique genres</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Avg Rating</p>
                <h2 className="stat-value">
                  {movies.length > 0 ? (movies.reduce((sum, m) => sum + m.rating, 0) / movies.length).toFixed(1) : "N/A"}
                </h2>
                <p className="stat-sub">Across all movies</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Latest Release</p>
                <h2 className="stat-value">
                  {movies.length > 0 ? Math.max(...movies.map(m => m.release_year)) : "N/A"}
                </h2>
                <p className="stat-sub">Most recent year</p>
              </div>
            </div>

            {/* Chart 1 — Dummy data (unchanged) */}
            <div className="chart-card" style={{ marginTop: "32px" }}>
              <MoviesChart movies={movies} />
            </div>

            {/* Chart 2 — Live data from Flask backend */}
            <div className="chart-card" style={{ marginTop: "32px" }}>
              <MoviesChartFromAPI />
            </div>

          </div>
        )}

        {activePage === "add" && (
          <MovieForm form={form} errors={errors} message={message} error={error} onChange={handleChange} onSubmit={handleSubmit} />
        )}

        {activePage === "movies" && (
          <MovieTable onDataChange={fetchMovies} />
        )}
      </div>
    </div>
  );
}