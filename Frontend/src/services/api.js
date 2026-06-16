const API_BASE = "https://moviesapi.up.railway.app";

export const authService = {
  login: (email, password) => {
    return fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then((res) => res.json().then((data) => ({ status: res.status, data })));
  },

  register: (email, password) => {
    return fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then((res) => res.json().then((data) => ({ status: res.status, data })));
  },

  forgotPassword: (email) => {
    return fetch(`${API_BASE}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).then((res) => {
      if (!res.ok) throw new Error("API error");
      return res.json();
    });
  },
};

export const movieService = {
  getMovies: () => {
    return fetch(`${API_BASE}/movies`).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch movies");
      return res.json();
    });
  },

  addMovie: (payload) => {
    return fetch(`${API_BASE}/movies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to add movie");
      return res.json();
    });
  },

  deleteMovie: (id) => {
    return fetch(`${API_BASE}/movies/${id}`, {
      method: "DELETE",
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to delete movie");
      return res.json();
    });
  },

  updateMovie: (id, payload) => {
    return fetch(`${API_BASE}/movies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to update movie");
      return res.json();
    });
  },

  getMoviesByGenreChart: () => {
    return fetch(`${API_BASE}/movies/chart/by-genre`).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch chart data");
      return res.json();
    });
  },

getPaginatedMovies: ({
  page = 1,
  limit = 5,
  sort_by = "movie_id",
  sort_order = "asc",
  search = "",
} = {}) => {
  const params = new URLSearchParams({ page, limit, sort_by, sort_order, search });
  return fetch(`${API_BASE}/movies/paginated?${params}`).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch paginated movies");
    return res.json();
  });
},
};