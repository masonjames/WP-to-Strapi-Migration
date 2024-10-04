// src/mappers/intermediate.ts

import { ContentModel } from '../models/content';
import { SEOModel } from '../models/seo';
import { logger } from '../utils/logger';

export function mapToIntermediate(
  sourceData: any[],
  sourceCMS: string,
  customMappings?: Record<string, string>
): ContentModel[] {
  logger.info(`Mapping ${sourceCMS} content to intermediate format`);

  if (!Array.isArray(sourceData)) {
    logger.error('Source data is not an array');
    throw new Error('Invalid source data format');
  }

  return sourceData
    .map((item) => {
      try {
        let newItem: ContentModel;

        switch (sourceCMS.toLowerCase()) {
          case 'wordpress':
            newItem = mapWordPressItemToIntermediate(item);
            break;
          case 'drupal':
            newItem = mapDrupalItemToIntermediate(item);
            break;
          default:
            logger.warn(`Unknown CMS type: ${sourceCMS}`);
            return null;
        }

        // Apply custom mappings if any
        if (customMappings) {
          applyCustomMappings(newItem, item, customMappings);
        }

        return newItem;
      } catch (error) {
        logger.error(`Error mapping item ID ${item.id}: ${error.message}`);
        return null;
      }
    })
    .filter((item): item is ContentModel => item !== null);
}

function mapWordPressItemToIntermediate(item: any): ContentModel {
  const newItem = new ContentModel();

  newItem.id = item.id;
  newItem.title = item.title.rendered;
  newItem.body = item.content.rendered;
  newItem.slug = item.slug;
  newItem.createdAt = item.date;
  newItem.updatedAt = item.modified;
  newItem.postType = item.type;
  newItem.categories = item.categories;
  newItem.tags = item.tags;

  // Handle custom fields (ACF)
  newItem.customFields = item.acf || {};

  // Handle featured image
  if (item._embedded && item._embedded['wp:featuredmedia']) {
    const media = item._embedded['wp:featuredmedia'][0];
    newItem.featuredImage = {
      id: media.id,
      url: media.source_url,
      altText: media.alt_text,
      caption: media.caption.rendered,
      filename: media.media_details.file,
      mimeType: media.mime_type,
      width: media.media_details.width,
      height: media.media_details.height,
    };
  }

  // Handle Yoast SEO data
  if (item.yoast_seo) {
    newItem.seo = new SEOModel({
      title: item.yoast_seo.title,
      metaDesc: item.yoast_seo.metadesc,
      focusKeyword: item.yoast_seo.focuskw,
      metaKeywords: item.yoast_seo.metakeywords,
      metaRobotsNoindex: item.yoast_seo.meta_robots_noindex,
      metaRobotsNofollow: item.yoast_seo.meta_robots_nofollow,
      opengraphTitle: item.yoast_seo.opengraph_title,
      opengraphDescription: item.yoast_seo.opengraph_description,
      opengraphImage: item.yoast_seo.opengraph_image,
      twitterTitle: item.yoast_seo.twitter_title,
      twitterDescription: item.yoast_seo.twitter_description,
      twitterImage: item.yoast_seo.twitter_image,
      canonical: item.yoast_seo.canonical,
      schema: item.yoast_seo.schema,
    });
  }

  return newItem;
}

function mapDrupalItemToIntermediate(item: any): ContentModel {
  // Implement Drupal-specific mapping logic
  throw new Error('Drupal mapping not implemented yet.');
}

function applyCustomMappings(
  newItem: ContentModel,
  sourceItem: any,
  customMappings: Record<string, string>
): void {
  Object.entries(customMappings).forEach(([targetKey, sourceKey]) => {
    (newItem as any)[targetKey] = sourceItem[sourceKey];
  });
}