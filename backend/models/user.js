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
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('User', userSchema);