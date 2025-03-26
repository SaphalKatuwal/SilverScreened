const express = require('express');
const router = express.Router();
const { searchMovies, getMovieDetails, getPopularMovies, getTopRatedMovies, discoverMovies } = require('../controllers/movieController');

router.get('/search', searchMovies);
router.get('/:id', getMovieDetails);
router.get('/popular', getPopularMovies);
router.get('/top-rated', getTopRatedMovies);
router.get('/discover', discoverMovies);

module.exports = router;