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
      const postTypes = await fetchWordPressPostTypes(answers.siteUrl, answers.auth);
      sourceContent = await fetchWordPressContent(answers.siteUrl, answers.auth, postTypes);
      logger.info(`WordPress content fetched successfully. Total items: ${sourceContent.length}`);
    } else if (answers.sourceCMS === 'Drupal') {
      sourceContent = await fetchDrupalContent(answers.siteUrl, answers.auth);
      logger.info(`Drupal content fetched successfully. Total items: ${sourceContent.length}`);
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

    intermediateContent = mapToIntermediate(sourceContent, answers.sourceCMS, answers.customMappings);
    logger.info(`Content mapped to intermediate format successfully. Total items: ${intermediateContent.length}`);

    // Handle media downloads
    if (answers.includeMedia) {
      for (const content of intermediateContent) {
        if (content.featuredImage) {
          const destinationPath = path.join('media', content.featuredImage.filename);
          await downloadMedia(content.featuredImage.url, destinationPath);
          content.featuredImage.localPath = destinationPath;
        }
      }
      logger.info('Media files downloaded successfully.');
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
      logger.info(`Content mapped to Strapi format successfully. Total items: ${destinationContent.length}`);
    } else if (answers.destinationCMS === 'Jamstack') {
      destinationContent = mapToJamstack(intermediateContent);
      logger.info(`Content mapped to Jamstack format successfully. Total items: ${destinationContent.length}`);
    }

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