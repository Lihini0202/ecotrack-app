const axios = require('axios');

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

const getEcoNews = async () => {
  try {
    const response = await axios.get(NEWS_API_URL, {
      params: {
        q: 'sustainability OR environment OR eco-friendly OR climate change',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 10,
        apiKey: NEWS_API_KEY
      }
    });
    return response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      imageUrl: article.urlToImage,
      publishedAt: article.publishedAt
    }));
  } catch (err) {
    console.error('News API error:', err);
    return [];
  }
};

module.exports = { getEcoNews };