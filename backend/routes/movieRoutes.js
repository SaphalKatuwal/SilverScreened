const express = require('express');
const router = express.Router();
const { searchMovies, getMovieDetails, getPopularMovies, getTopRatedMovies, discoverMovies } = require('../controllers/movieController');

// Specific routes should come before parameterized routes
router.get('/search', searchMovies);
router.get('/popular', getPopularMovies);
router.get('/top-rated', getTopRatedMovies);
router.get('/discover', discoverMovies);
router.get('/:id', getMovieDetails);

module.exports = router;