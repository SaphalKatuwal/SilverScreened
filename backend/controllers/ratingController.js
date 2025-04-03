const User = require('../models/user');

const rateMovie = async (req, res) => {
  const { movieId, rating } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update or add rating
    const ratingIndex = user.ratings.findIndex(r => r.movieId === movieId);
    if (ratingIndex >= 0) {
      user.ratings[ratingIndex].rating = rating;
    } else {
      user.ratings.push({ movieId, rating });
    }

    await user.save();
    res.json({ message: 'Rating updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMovieRating = async (req, res) => {
  const { movieId } = req.params;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const rating = user.ratings.find(r => r.movieId === movieId);
    res.json({ rating: rating ? rating.rating : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { rateMovie, getMovieRating }; 