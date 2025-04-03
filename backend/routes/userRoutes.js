const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
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
} = require('../controllers/userController');

router.get('/profile', auth, getProfile);
router.put('/profile', auth, upload.single('profilePicture'), updateProfile);
router.post('/watchlist/add', auth, addToWatchlist);
router.post('/watchlist/remove', auth, removeFromWatchlist);
router.post('/watched', auth, markAsWatched);
router.post('/follow', auth, followUser);
router.post('/unfollow', auth, unfollowUser);
router.get('/friends', auth, getFriends);
router.get('/followers', auth, getFollowers);
router.get('/watched-details', auth, getWatchedDetails);
router.get('/suggested', auth, getSuggestedUsers);
router.get('/activity', auth, getUserActivity);

module.exports = router;