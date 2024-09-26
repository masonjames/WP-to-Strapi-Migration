const axios = require('axios');
const { authenticateWordPress } = require('../utils/auth');
const { logger } = require('../utils/logger');

async function fetchWordPressContent(siteUrl, auth, postTypes = ['posts', 'pages']) {
  try {
    if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
      siteUrl = 'https://' + siteUrl;
    }

    let headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'x-wp-total, x-wp-totalpages'
    };

    if (auth) {
      const token = await authenticateWordPress(siteUrl, auth);
      headers['Authorization'] = `Bearer ${token}`;
    }

    let allContent = [];

    for (const postType of postTypes) {
      const baseUrl = `${siteUrl}/wp-json/wp/v2/${postType}`;
      logger.info(`Fetching WordPress content for post type: ${postType}`);

      try {
        // First, get the total number of pages
        const initialResponse = await axios.get(`${baseUrl}?per_page=100`, { headers });
        const totalPages = parseInt(initialResponse.headers['x-wp-totalpages']) || 1;

        // Fetch all pages
        const pagePromises = [];
        for (let page = 1; page <= totalPages; page++) {
          pagePromises.push(axios.get(`${baseUrl}?per_page=100&page=${page}`, { headers }));
        }

        const pageResponses = await Promise.all(pagePromises);
        const pageData = pageResponses.map(response => response.data);
        const flattenedData = pageData.flat();

        allContent = [...allContent, ...flattenedData];
        logger.info(`Successfully fetched ${flattenedData.length} items for ${postType}`);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          logger.error(`Authentication required for post type ${postType}. Please provide valid credentials.`);
          break;
        } else if (error.response && error.response.status === 404) {
          logger.warn(`Post type ${postType} not found or not accessible. Skipping.`);
        } else if (error.response && error.response.status === 502) {
          logger.warn(`Server error (502 Bad Gateway) when fetching ${postType}. The server might be overloaded. Retrying...`);
          // Implement a retry mechanism here
          // For example, wait for a few seconds and try again
          await new Promise(resolve => setTimeout(resolve, 5000));
          try {
            const retryResponse = await axios.get(`${baseUrl}?per_page=100`, { headers });
            const retryData = retryResponse.data;
            allContent = [...allContent, ...retryData];
            logger.info(`Successfully fetched ${retryData.length} items for ${postType} after retry`);
          } catch (retryError) {
            logger.error(`Failed to fetch ${postType} even after retry: ${retryError.message}`);
          }
        } else {
          logger.warn(`Error fetching content for post type ${postType}: ${error.message}`);
          if (error.response) {
            logger.warn(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
          }
        }
        continue;
      }
    }

    // Fetch Yoast SEO data if available
    try {
      const yoastUrl = `${siteUrl}/wp-json/yoast/v1/get_head?url=${siteUrl}`;
      const yoastResponse = await axios.get(yoastUrl, { headers });
      const yoastData = yoastResponse.data;
      logger.info('Successfully fetched Yoast SEO data');

      allContent = allContent.map(post => ({...post, yoast_seo: yoastData[post.link] || {}}));
    } catch (yoastError) {
      logger.warn('Yoast SEO data not available or error fetching Yoast SEO data', yoastError.message);
    }

    // Fetch ACF data if available
    try {
      const acfUrl = `${siteUrl}/wp-json/acf/v3/posts`;
      const acfResponse = await axios.get(acfUrl, { headers });
      const acfData = acfResponse.data;
      logger.info('Successfully fetched ACF data');

      allContent = allContent.map(post => {
        const acfFields = acfData.find(acf => acf.id === post.id);
        return {...post, acf: acfFields ? acfFields.acf : {}};
      });
    } catch (acfError) {
      logger.warn('ACF data not available or error fetching ACF data', acfError.message);
    }

    if (allContent.length > 0) {
      logger.info(`WordPress content fetched successfully. Total items: ${allContent.length}`);
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

    let headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'x-wp-total, x-wp-totalpages'
    };

    if (auth) {
      const token = await authenticateWordPress(siteUrl, auth);
      headers['Authorization'] = `Bearer ${token}`;
    }

    const apiUrl = `${siteUrl}/wp-json/wp/v2/types`;

    logger.info('Fetching WordPress post types');
    const response = await axios.get(apiUrl, { headers });
    
    const postTypes = Object.values(response.data)
    .filter(typeObj => typeObj.slug !== 'attachment' && typeObj.rest_base)
    .map(typeObj => typeObj.rest_base);
    
    logger.info('WordPress post types fetched:', postTypes);
    return postTypes;
  } catch (error) {
    logger.error('Error fetching WordPress post types:', error.message);
    if (error.response) {
      logger.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
    }
    // Return default post types if unable to fetch
    return ['posts', 'pages'];
  }
}

module.exports = { fetchWordPressContent, fetchWordPressPostTypes };