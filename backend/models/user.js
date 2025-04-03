const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  location: String,
  bio: String,
  profilePicture: { type: String, required: true },
  favoriteFilms: [{ type: String }], // TMDb movie IDs, up to 5
  watchlist: [{ type: String }],
  watchedMovies: [{ movieId: String, watchedAt: { type: Date, default: Date.now } }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  ratings: [{ movieId: String, rating: { type: Number, min: 1, max: 5 } }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);