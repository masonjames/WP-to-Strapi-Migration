const axios = require('axios');
const { authenticateDrupal } = require('../utils/auth');
const { logger } = require('../utils/logger');

async function fetchDrupalContent(siteUrl, auth) {
  try {
    const apiUrl = `${siteUrl}/jsonapi/node/article`;
    const headers = auth ? await authenticateDrupal(siteUrl, auth) : {};
    
    const response = await axios.get(apiUrl, { headers });
    
    const postsWithMedia = await Promise.all(response.data.data.map(async (post) => {
      if (post.relationships.field_image.data) {
        const mediaResponse = await axios.get(`${siteUrl}${post.relationships.field_image.links.related.href}`, { headers });
        post.featuredImage = mediaResponse.data.data;
      }
      return post;
    }));

    logger.info('Drupal content and media fetched successfully.');
    return postsWithMedia;
  } catch (error) {
    logger.error('Error fetching Drupal content:', error);
    throw error;
  }
}

module.exports = { fetchDrupalContent };