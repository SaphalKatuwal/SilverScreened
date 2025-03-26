const User = require('../models/user');
const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const getSocialRecommendations = async (userId) => {
  try {
    const user = await User.findById(userId).populate({
      path: 'following',
      populate: { path: 'reviews', match: { rating: { $gte: 4 } } }
    });
    if (!user) throw new Error('User not found');

    const followedUsers = user.following;

    // Get watched movies from followed users
    const watchedByFollowed = followedUsers.flatMap(f => f.watchedMovies.map(wm => wm.movieId));

    // Get highly rated movies from followed users' reviews
    const highlyRatedByFollowed = followedUsers.flatMap(f => f.reviews.map(r => r.movieId));

    // Combine and remove duplicates
    const recommendedMovieIds = [...new Set([...watchedByFollowed, ...highlyRatedByFollowed])];

    // Exclude movies the current user has watched
    const userWatched = user.watchedMovies.map(wm => wm.movieId);
    const recommendations = recommendedMovieIds.filter(id => !userWatched.includes(id));

    // Fetch movie details from TMDb
    const movieDetails = await Promise.all(
      recommendations.slice(0, 10).map(async (id) => {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
          params: { api_key: TMDB_API_KEY },
        });
        return response.data;
      })
    );

    return movieDetails;
  } catch (err) {
    throw err;
  }
};

const getGenreRecommendations = async (userId) => {
  try {
    const user = await User.findById(userId).populate('reviews');
    if (!user) throw new Error('User not found');

    // Get watched movies with timestamps
    const watched = user.watchedMovies.map(wm => ({ movieId: wm.movieId, timestamp: wm.watchedAt }));

    // Get reviewed movies with timestamps from reviews
    const reviewed = user.reviews.map(r => ({ movieId: r.movieId, timestamp: r.createdAt }));

    // Combine and sort by timestamp descending
    const interactions = [...watched, ...reviewed].sort((a, b) => b.timestamp - a.timestamp);

    // Get unique movie IDs, up to 10
    const uniqueMovieIds = [];
    const seen = new Set();
    for (const interaction of interactions) {
      if (!seen.has(interaction.movieId)) {
        seen.add(interaction.movieId);
        uniqueMovieIds.push(interaction.movieId);
        if (uniqueMovieIds.length === 10) break;
      }
    }

    // Fetch genres for these movies
    const genres = await Promise.all(
      uniqueMovieIds.map(async (id) => {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
          params: { api_key: TMDB_API_KEY },
        });
        return response.data.genres.map(g => g.id);
      })
    );

    // Flatten and count genre frequencies
    const genreCounts = genres.flat().reduce((acc, genreId) => {
      acc[genreId] = (acc[genreId] || 0) + 1;
      return acc;
    }, {});

    // Get top 3 genres
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    if (topGenres.length === 0) return [];

    // Fetch recommendations from TMDb
    const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        with_genres: topGenres.join(','),
        sort_by: 'popularity.desc',
      },
    });

    const recommendedMovies = response.data.results;
    const userWatchedIds = user.watchedMovies.map(wm => wm.movieId);
    const filteredRecommendations = recommendedMovies.filter(movie => !userWatchedIds.includes(movie.id.toString()));

    return filteredRecommendations.slice(0, 10);
  } catch (err) {
    throw err;
  }
};

module.exports = { getSocialRecommendations, getGenreRecommendations };