const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const searchMovies = async (req, res) => {
  const { query } = req.query;
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: { api_key: TMDB_API_KEY, query },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMovieDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const movieResponse = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: { api_key: TMDB_API_KEY, append_to_response: 'credits,videos' },
    });
    res.json(movieResponse.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPopularMovies = async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTopRatedMovies = async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/top_rated`, {
      params: { api_key: TMDB_API_KEY },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const discoverMovies = async (req, res) => {
  const { genre, rating, decade } = req.query;
  try {
    const params = { api_key: TMDB_API_KEY, sort_by: 'popularity.desc' };
    if (genre) params.with_genres = genre;
    if (rating) params['vote_average.gte'] = parseFloat(rating);
    if (decade) {
      const startYear = parseInt(decade);
      params['primary_release_date.gte'] = `${startYear}-01-01`;
      params['primary_release_date.lte'] = `${startYear + 9}-12-31`;
    }
    const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, { params });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { searchMovies, getMovieDetails, getPopularMovies, getTopRatedMovies, discoverMovies };