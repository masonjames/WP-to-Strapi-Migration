const { fetchWordPressContent, fetchWordPressPostTypes } = require('./connectors/wordpress');
const { fetchDrupalContent } = require('./connectors/drupal');
const { mapToIntermediate } = require('./mappers/intermediate');
const { mapToJamstack } = require('./mappers/jamstack');
const { postToStrapi } = require('./connectors/strapi'); // New import
const fs = require('node:fs');
const path = require('node:path');
const { logger } = require('./utils/logger');
const { downloadMedia } = require('./utils/media-handler');
const { analyzeSEO } = require('./utils/seo-analyzer');

async function generateMigrationPath(answers) {
  try {
    let sourceContent = [];
    if (answers.sourceCMS === 'WordPress') {
      const postTypes = await fetchWordPressPostTypes(answers.siteUrl, answers.auth);
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
        error: 'No content fetched from source CMS',
      };
    }

    logger.info(`${answers.sourceCMS} content fetched successfully. Total items: ${sourceContent.length}`);

    let intermediateContent = mapToIntermediate(sourceContent, answers.sourceCMS, answers.customMappings);
    logger.info(`Content mapped to intermediate format successfully. Total items: ${intermediateContent.length}`);

    // Handle media downloads
    if (answers.includeMedia) {
      const mediaDownloadPromises = intermediateContent.map(async (content) => {
        if (content.featuredImage) {
          try {
            const mediaDir = path.join('media');
            if (!fs.existsSync(mediaDir)) {
              fs.mkdirSync(mediaDir, { recursive: true });
            }
            const destinationPath = path.join(mediaDir, content.featuredImage.filename);
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
      logger.info(`Content mapped to Strapi format successfully. Total items: ${destinationContent.length}`);

      // Post content to Strapi
      for (const contentItem of destinationContent) {
        try {
          await postToStrapi(contentItem, answers.strapiUrl, answers.strapiApiKey);
        } catch (error) {
          logger.error(`Failed to post content ID: ${contentItem.id}`, error);
        }
      }
    } else if (answers.destinationCMS === 'Jamstack') {
      destinationContent = mapToJamstack(intermediateContent);
    }

    return {
      source: answers.sourceCMS,
      destination: answers.destinationCMS,
      contentSample: destinationContent ? destinationContent[0] : null,
      seoAnalysis: seoAnalysis,
    };
  } catch (error) {
    logger.error('Error in migration process:', error);
    return {
      source: answers.sourceCMS,
      destination: answers.destinationCMS,
      contentSample: null,
      seoAnalysis: null,
      error: error.message,
    };
  }
}

async function saveMigrationResult(migrationPath, outputDir = 'output') {
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `migration_${Date.now()}.json`;
    const filepath = path.join(outputDir, filename);

    await fs.promises.writeFile(filepath, JSON.stringify(migrationPath, null, 2));
    logger.info(`Migration result saved to ${filepath}`);
  } catch (error) {
    logger.error('Error saving migration result:', error);
  }
}

module.exports = { generateMigrationPath, saveMigrationResult };