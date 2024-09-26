const axios = require('axios');
const { authenticateWordPress } = require('../utils/auth');
const { logger } = require('../utils/logger');

async function fetchWordPressContent(siteUrl, auth, postTypes = ['posts', 'pages']) {
  try {
    if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
      siteUrl = 'https://' + siteUrl;
    }

    const headers = auth ? { Authorization: `Bearer ${auth.token}` } : {};
    let allContent = [];

    // Fetch content for each post type
    for (const postType of postTypes) {
      const apiUrl = `${siteUrl}/wp-json/wp/v2/${postType}`;
      logger.info(`Fetching WordPress content for post type: ${postType}`);

      try {
        const response = await axios.get(apiUrl, { headers });
        allContent = [...allContent, ...response.data];
        logger.info(`Successfully fetched ${response.data.length} items for ${postType}`);
      } catch (error) {
        logger.warn(`Error fetching content for post type ${postType}: ${error.message}`);
        if (error.response) {
          logger.warn(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
        }
        // Continue with the next post type instead of breaking the whole process
        continue;
      }
    }

    // Fetch Yoast SEO data
    try {
      const yoastUrl = `${siteUrl}/wp-json/yoast/v1/get_head`;
      const yoastResponse = await axios.get(yoastUrl, { headers });
      const yoastData = yoastResponse.data;
      logger.info('Successfully fetched Yoast SEO data');

      // Merge Yoast SEO data with corresponding posts
      allContent = allContent.map(post => {
        const postUrl = post.link;
        const postYoastData = yoastData[postUrl] || {};
        return { ...post, yoast_seo: postYoastData };
      });
    } catch (yoastError) {
      logger.warn('Yoast SEO data not available or error fetching Yoast SEO data', yoastError.message);
      if (yoastError.response) {
        logger.warn(`Status: ${yoastError.response.status}, Data: ${JSON.stringify(yoastError.response.data)}`);
      }
    }

    // Fetch custom fields (ACF) if available
    try {
      const acfUrl = `${siteUrl}/wp-json/acf/v3/posts`;
      const acfResponse = await axios.get(acfUrl, { headers });
      const acfData = acfResponse.data;
      logger.info('Successfully fetched ACF data');

      // Merge ACF data with corresponding posts
      allContent = allContent.map(post => {
        const acfFields = acfData.find(acf => acf.id === post.id);
        return { ...post, acf: acfFields ? acfFields.acf : {} };
      });
    } catch (acfError) {
      logger.warn('ACF data not available or error fetching ACF data', acfError.message);
      if (acfError.response) {
        logger.warn(`Status: ${acfError.response.status}, Data: ${JSON.stringify(acfError.response.data)}`);
      }
    }

    logger.info('WordPress content fetched successfully.');
    if (allContent.length > 0) {
      logger.info(`Total items fetched: ${allContent.length}`);
      logger.info('Sample post:', JSON.stringify(allContent[0], null, 2));
    } else {
      logger.warn('No content was fetched from WordPress');
    }
    return allContent;
  } catch (error) {
    logger.error('Error fetching WordPress content:', error.message);
    throw error;
  }
}

async function fetchWordPressPostTypes(siteUrl, auth) {
  try {
    if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
      siteUrl = 'https://' + siteUrl;
    }

    const apiUrl = `${siteUrl}/wp-json/wp/v2/types`;
    const headers = auth ? { Authorization: `Bearer ${auth.token}` } : {};

    logger.info('Fetching WordPress post types');
    const response = await axios.get(apiUrl, { headers });
    
    const postTypes = Object.keys(response.data).filter(type => 
      type !== 'attachment' && response.data[type].rest_base
    );
    logger.info('WordPress post types fetched:', postTypes);
    return postTypes;
  } catch (error) {
    logger.error('Error fetching WordPress post types:', error.message);
    if (error.response) {
      logger.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

module.exports = { fetchWordPressContent, fetchWordPressPostTypes };