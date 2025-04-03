const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { rateMovie, getMovieRating } = require('../controllers/ratingController');

router.post('/', auth, rateMovie);
router.get('/:movieId', auth, getMovieRating);

module.exports = router; 