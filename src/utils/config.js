// File: src/utils/config.js

const { parse } = require('dotenv');
const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');

/**
 * Parses the .env file to extract site configurations.
 * @returns {Array} - Array of site configuration objects.
 */
function parseSiteConfigs() {
  const envPath = path.resolve(__dirname, '../../.env'); // Adjust the path based on your project structure
  if (!fs.existsSync(envPath)) {
    logger.error('.env file not found. Please create one based on .env.example.');
    process.exit(1);
  }

  const envConfig = parse(fs.readFileSync(envPath));

  const siteCount = parseInt(envConfig.SITE_COUNT, 10) || 0;
  const sites = [];

  for (let i = 1; i <= siteCount; i++) {
    const wordpressUrl = envConfig[`SITE_${i}_WORDPRESS_URL`];
    const strapiUrl = envConfig[`SITE_${i}_STRAPI_URL`];
    const strapiApiKey = envConfig[`SITE_${i}_STRAPI_API_KEY`];
    const username = envConfig[`SITE_${i}_USERNAME`];
    const password = envConfig[`SITE_${i}_PASSWORD`];

    if (!wordpressUrl || !strapiUrl || !strapiApiKey) {
      logger.warn(`Incomplete configuration for site ${i}. Skipping this site.`);
      continue;
    }

    sites.push({
      sourceCMS: 'WordPress', // Adjust if you have multiple source CMS types
      wordpressUrl,
      strapiUrl,
      strapiApiKey,
      auth: username && password ? { username, password } : null,
      customMappings: {
        // Define any custom mappings per site if necessary
      },
      includeMedia: envConfig.INCLUDE_MEDIA === 'true',
      performSEOAnalysis: envConfig.PERFORM_SEO_ANALYSIS === 'true',
      slug: `site${i}`, // Optional: for segregating media or logs
    });
  }

  return sites;
}

module.exports = { parseSiteConfigs };