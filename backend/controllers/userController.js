const User = require('../models/user');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProfile = async (req, res) => {
  const { username, location, bio, favoriteFilms } = req.body;
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) return res.status(400).json({ error: 'Username already exists' });
      user.username = username;
    }

    user.location = location || user.location;
    user.bio = bio || user.bio;
    if (profilePicture) user.profilePicture = profilePicture;
    if (favoriteFilms) {
      const films = JSON.parse(favoriteFilms);
      if (films.length > 5) return res.status(400).json({ error: 'Maximum 5 favorite films allowed' });
      user.favoriteFilms = films;
    }

    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addToWatchlist = async (req, res) => {
  const { movieId } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.watchlist.includes(movieId)) {
      user.watchlist.push(movieId);
      await user.save();
    }
    res.json({ message: 'Added to watchlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeFromWatchlist = async (req, res) => {
  const { movieId } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.watchlist = user.watchlist.filter(id => id !== movieId);
    await user.save();
    res.json({ message: 'Removed from watchlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markAsWatched = async (req, res) => {
  const { movieId } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const alreadyWatched = user.watchedMovies.some(wm => wm.movieId === movieId);
    if (!alreadyWatched) {
      user.watchedMovies.push({ movieId });
      await user.save();
    }
    res.json({ message: 'Marked as watched' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const followUser = async (req, res) => {
  const { followId } = req.body;
  try {
    const user = await User.findById(req.userId);
    const followUser = await User.findById(followId);
    if (!user || !followUser) return res.status(404).json({ error: 'User not found' });
    if (!user.following.includes(followId)) {
      user.following.push(followId);
      await user.save();
    }
    res.json({ message: 'Followed user' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const unfollowUser = async (req, res) => {
  const { followId } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.following = user.following.filter(id => id.toString() !== followId);
    await user.save();
    res.json({ message: 'Unfollowed user' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('following');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const friends = await User.find({
      _id: { $in: user.following },
      following: { $in: [req.userId] },
    }).select('email username profilePicture');

    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFollowers = async (req, res) => {
  try {
    const followers = await User.find({ following: req.userId }).select('email username profilePicture');
    res.json(followers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getWatchedDetails = async (req, res) => {
  const { page = 1, limit = 10, sort = 'desc' } = req.query;
  try {
    const user = await User.findById(req.userId).populate('reviews');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const watchedMovies = user.watchedMovies;
    const reviewsMap = user.reviews.reduce((acc, review) => {
      acc[review.movieId] = review.rating;
      return acc;
    }, {});

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const sortedMovies = watchedMovies.sort((a, b) => {
      return sort === 'desc' ? b.watchedAt - a.watchedAt : a.watchedAt - b.watchedAt;
    });

    const paginatedMovies = sortedMovies.slice(startIndex, endIndex);

    const moviesWithDetails = await Promise.all(
      paginatedMovies.map(async (wm) => {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${wm.movieId}`, {
          params: { api_key: TMDB_API_KEY },
        });
        return {
          movieId: wm.movieId,
          title: response.data.title,
          poster: response.data.poster_path,
          releaseDate: response.data.release_date,
          loggedDate: wm.watchedAt,
          rating: reviewsMap[wm.movieId] || null,
        };
      })
    );

    res.json({
      movies: moviesWithDetails,
      total: watchedMovies.length,
      page: parseInt(page),
      totalPages: Math.ceil(watchedMovies.length / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSuggestedUsers = async (req, res) => {
  try {
    // Get users that the current user is not following
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const suggestedUsers = await User.find({
      _id: { $ne: req.user._id },
      _id: { $nin: user.following }
    })
    .select('email username watchedMovies')
    .limit(5);

    res.json(suggestedUsers);
  } catch (error) {
    console.error('Error getting suggested users:', error);
    res.status(500).json({ error: 'Failed to get suggested users' });
  }
};

const getUserActivity = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('watchedMovies')
      .populate('watchlist')
      .populate('reviews');

    if (!user) return res.status(404).json({ error: 'User not found' });

    const activities = [];

    // Add watched movies
    user.watchedMovies.forEach(movie => {
      activities.push({
        type: 'watch',
        movieId: movie._id,
        movieTitle: movie.title,
        timestamp: movie.watchedAt || new Date()
      });
    });

    // Add watchlist additions
    user.watchlist.forEach(movie => {
      activities.push({
        type: 'watchlist',
        movieId: movie._id,
        movieTitle: movie.title,
        timestamp: movie.addedAt || new Date()
      });
    });

    // Add reviews
    user.reviews.forEach(review => {
      activities.push({
        type: 'review',
        movieId: review.movie,
        movieTitle: review.movieTitle,
        timestamp: review.createdAt
      });
    });

    // Sort activities by timestamp and get the 5 most recent
    activities.sort((a, b) => b.timestamp - a.timestamp);
    res.json(activities.slice(0, 5));
  } catch (error) {
    console.error('Error getting user activity:', error);
    res.status(500).json({ error: 'Failed to get user activity' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  addToWatchlist,
  removeFromWatchlist,
  markAsWatched,
  followUser,
  unfollowUser,
  getFriends,
  getFollowers,
  getWatchedDetails,
  getSuggestedUsers,
  getUserActivity,
};