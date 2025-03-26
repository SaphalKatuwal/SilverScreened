const { getSocialRecommendations, getGenreRecommendations } = require('../utils/recommend');

const getRecommendations = async (req, res) => {
  try {
    const socialRecs = await getSocialRecommendations(req.userId);
    const genreRecs = await getGenreRecommendations(req.userId);
    res.json({ social: socialRecs, genre: genreRecs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getRecommendations };