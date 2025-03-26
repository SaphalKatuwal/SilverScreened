const Review = require('../models/review');

const createReview = async (req, res) => {
  const { movieId, rating, comment } = req.body;
  try {
    const review = new Review({
      user: req.userId,
      movieId,
      rating,
      comment,
    });
    await review.save();
    const User = require('../models/user');
    await User.findByIdAndUpdate(req.userId, { $push: { reviews: review._id } });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getReviews = async (req, res) => {
  const { movieId } = req.params;
  try {
    const reviews = await Review.find({ movieId }).populate('user', 'email');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  try {
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.user.toString() !== req.userId) return res.status(403).json({ error: 'Unauthorized' });
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteReview = async (req, res) => {
  const { id } = req.params;
  try {
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.user.toString() !== req.userId) return res.status(403).json({ error: 'Unauthorized' });
    await review.remove();
    const User = require('../models/user');
    await User.findByIdAndUpdate(req.userId, { $pull: { reviews: id } });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
};