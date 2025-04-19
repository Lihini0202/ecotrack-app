const { getEcoNews } = require('../services/newsService');
const { getEcoVideos } = require('../services/videoService');

// Get eco news
exports.getNews = async (req, res, next) => {
  try {
    const news = await getEcoNews();
    res.json(news);
  } catch (err) {
    next(err);
  }
};

// Get eco videos
exports.getVideos = async (req, res, next) => {
  try {
    const videos = await getEcoVideos();
    res.json(videos);
  } catch (err) {
    next(err);
  }
};