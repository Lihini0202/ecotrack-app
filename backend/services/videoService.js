const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

const getEcoVideos = async () => {
  try {
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        q: 'sustainability tips eco-friendly living',
        part: 'snippet',
        maxResults: 10,
        type: 'video',
        key: YOUTUBE_API_KEY
      }
    });
    return response.data.items.map(item => ({
      title: item.snippet.title,
      description: item.snippet.description,
      videoId: item.id.videoId,
      thumbnail: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt
    }));
  } catch (err) {
    console.error('YouTube API error:', err);
    return [];
  }
};

module.exports = { getEcoVideos };