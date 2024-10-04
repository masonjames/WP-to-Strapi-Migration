// File: src/connectors/strapi-admin.js
const axios = require('axios');
const { logger } = require('../utils/logger');

async function createStrapiContentType(apiUrl, apiKey, contentType) {
  try {
    const response = await axios.post(
      `${apiUrl}/content-types`,
      contentType,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );
    logger.info(`Successfully created content type: ${contentType.displayName}`);
    return response.data;
  } catch (error) {
    logger.error(`Error creating content type: ${contentType.displayName}`, error.message);
    throw error;
  }
}