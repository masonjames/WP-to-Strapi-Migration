const axios = require('axios');
const { logger } = require('./logger');

async function authenticateWordPress(siteUrl, credentials) {
  try {
    const response = await axios.post(`${siteUrl}/wp-json/jwt-auth/v1/token`, {
      username: credentials.username,
      password: credentials.password
    });
    
    return {
      token: response.data.token,
      type: 'Bearer'
    };
  } catch (error) {
    logger.error('WordPress authentication failed:', error);
    throw new Error('WordPress authentication failed');
  }
}

async function authenticateDrupal(siteUrl, credentials) {
  try {
    const response = await axios.post(`${siteUrl}/oauth/token`, {
      grant_type: 'password',
      client_id: 'your_client_id',
      client_secret: 'your_client_secret',
      username: credentials.username,
      password: credentials.password
    });
    
    return {
      Authorization: `Bearer ${response.data.access_token}`
    };
  } catch (error) {
    logger.error('Drupal authentication failed:', error);
    throw new Error('Drupal authentication failed');
  }
}

module.exports = { authenticateWordPress, authenticateDrupal };