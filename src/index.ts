// src/index.ts

import { fetchWordPressContent, fetchWordPressPostTypes } from './connectors/wordpress';
import { fetchDrupalContent } from './connectors/drupal';
import { mapToIntermediate } from './mappers/intermediate';
import { mapToStrapi } from './mappers/strapi';
import { mapToJamstack } from './mappers/jamstack';
import { postToStrapi } from './connectors/strapi';
import fs from 'fs-extra';
import path from 'path';
import { logger } from './utils/logger';
import { downloadMedia } from './utils/mediaHandler';
import { analyzeSEO } from './utils/seo-analyzer';
import { ContentModel } from './models/content';

interface MigrationAnswers {
  sourceCMS: string;
  siteUrl: string;
  auth: { username: string; password: string } | null;
  customMappings: Record<string, string>;
  includeMedia: boolean;
  performSEOAnalysis: boolean;
  destinationCMS: string;
  strapiUrl?: string;
  strapiApiKey?: string;
}

export async function generateMigrationPath(answers: MigrationAnswers): Promise<any> {
  logger.info('Received answers:', answers);

  try {
    let sourceContent: any[] = [];
    if (answers.sourceCMS === 'WordPress') {
      const postTypes = await fetchWordPressPostTypes(answers.siteUrl, answers.auth);
      logger.info('Fetched post types:', postTypes);

      sourceContent = await fetchWordPressContent(answers.siteUrl, answers.auth, postTypes);
    } else if (answers.sourceCMS === 'Drupal') {
      sourceContent = await fetchDrupalContent(answers.siteUrl, answers.auth);
    }

    if (!sourceContent || sourceContent.length === 0) {
      throw new Error('No content fetched from source CMS');
    }

    logger.info(`${answers.sourceCMS} content fetched successfully. Total items: ${sourceContent.length}`);

    const intermediateContent = mapToIntermediate(sourceContent, answers.sourceCMS, answers.customMappings);
    logger.info(`Content mapped to intermediate format successfully. Total items: ${intermediateContent.length}`);

    // Handle media downloads
    if (answers.includeMedia) {
      const mediaDownloadPromises = intermediateContent.map(async (content) => {
        if (content.featuredImage?.url) {
          try {
            const mediaDir = path.join('media');
            if (!fs.existsSync(mediaDir)) {
              fs.mkdirSync(mediaDir, { recursive: true });
            }
            const fileName = path.basename(content.featuredImage.url);
            const destinationPath = path.join(mediaDir, fileName);
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
      seoAnalysis = intermediateContent.map((content) => ({
        id: content.id,
        seoScore: analyzeSEO(content),
      }));
      logger.info('SEO analysis completed successfully.');
    }

    let destinationContent;
    if (answers.destinationCMS === 'Strapi') {
      destinationContent = intermediateContent; // Assuming direct mapping
      logger.info(`Content mapped to Strapi format successfully. Total items: ${destinationContent.length}`);

      // Post content to Strapi
      for (const contentItem of destinationContent) {
        try {
          await postToStrapi(contentItem, answers.strapiUrl!, answers.strapiApiKey!, contentItem.postType);
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

export async function saveMigrationResult(migrationPath: any, outputDir = 'output'): Promise<void> {
  try {
    await fs.ensureDir(outputDir);

    const filename = `migration_${Date.now()}.json`;
    const filepath = path.join(outputDir, filename);

    await fs.writeFile(filepath, JSON.stringify(migrationPath, null, 2));
    logger.info(`Migration result saved to ${filepath}`);
  } catch (error) {
    logger.error('Error saving migration result:', error);
  }
}