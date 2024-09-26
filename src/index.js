const { fetchWordPressContent, fetchWordPressPostTypes } = require('./connectors/wordpress');
const { fetchDrupalContent } = require('./connectors/drupal');
const { mapToIntermediate } = require('./mappers/intermediate');
const { mapToStrapi } = require('./mappers/strapi');
const { mapToJamstack } = require('./mappers/jamstack');
const fs = require('node:fs');
const path = require('node:path');
const { logger } = require('./utils/logger');
const { downloadMedia } = require('./utils/media-handler');
const { analyzeSEO } = require('./utils/seo-analyzer');

async function generateMigrationPath(answers) {
  let sourceContent;
  let intermediateContent;

  try {
    if (answers.sourceCMS === 'WordPress') {
      let postTypes;
      try {
        postTypes = await fetchWordPressPostTypes(answers.siteUrl, answers.auth);
      } catch (error) {
        logger.warn('Failed to fetch custom post types. Falling back to default post types.');
        postTypes = ['posts', 'pages'];
      }
      sourceContent = await fetchWordPressContent(answers.siteUrl, answers.auth, postTypes);
    } else if (answers.sourceCMS === 'Drupal') {
      sourceContent = await fetchDrupalContent(answers.siteUrl, answers.auth);
    }

    if (!sourceContent || sourceContent.length === 0) {
      logger.warn('No content fetched from source CMS');
      return {
        source: answers.sourceCMS,
        destination: answers.destinationCMS,
        contentSample: null,
        seoAnalysis: null,
        error: 'No content fetched from source CMS'
      };
    }

    logger.info(`${answers.sourceCMS} content fetched successfully. Total items: ${sourceContent.length}`);

    intermediateContent = mapToIntermediate(sourceContent, answers.sourceCMS, answers.customMappings);
    logger.info(`Content mapped to intermediate format successfully. Total items: ${intermediateContent.length}`);

    // Handle media downloads
    if (answers.includeMedia) {
      const mediaDownloadPromises = intermediateContent.map(async (content) => {
        if (content.featuredImage) {
          try {
            const destinationPath = path.join('media', content.featuredImage.filename);
            await downloadMedia(content.featuredImage.url, destinationPath);
            content.featuredImage.localPath = destinationPath;
            logger.info(`Successfully downloaded media for content ID: ${content.id}`);
          } catch (error) {
            logger.error(`Failed to download media for content ID: ${content.id}`, error);
          }
        }
      });

      await Promise.all(mediaDownloadPromises);
      logger.info('Media files download process completed.');
    }

    // Perform SEO analysis
    let seoAnalysis;
    if (answers.performSEOAnalysis) {
      seoAnalysis = intermediateContent.map(content => ({
        id: content.id,
        seoScore: analyzeSEO(content),
      }));
      logger.info('SEO analysis completed successfully.');
    }

    let destinationContent;
    if (answers.destinationCMS === 'Strapi') {
      destinationContent = mapToStrapi(intermediateContent);
    } else if (answers.destinationCMS === 'Jamstack') {
      destinationContent = mapToJamstack(intermediateContent);
    }

    logger.info(`Content mapped to ${answers.destinationCMS} format successfully. Total items: ${destinationContent.length}`);

    return {
      source: answers.sourceCMS,
      destination: answers.destinationCMS,
      contentSample: destinationContent[0],
      seoAnalysis: seoAnalysis,
    };
  } catch (error) {
    logger.error('Error in migration process:', error);
    return {
      source: answers.sourceCMS,
      destination: answers.destinationCMS,
      contentSample: null,
      seoAnalysis: null,
      error: error.message
    };
  }
}

module.exports = { generateMigrationPath };