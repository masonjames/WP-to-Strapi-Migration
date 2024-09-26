const { ContentModel } = require('../models/content');
const { SEOModel } = require('../models/seo');
const { logger } = require('../utils/logger');

function mapToIntermediate(sourceData, sourceCMS, customMappings) {
  logger.info(`Mapping ${sourceCMS} content to intermediate format`);

  if (!Array.isArray(sourceData)) {
    logger.error('Source data is not an array');
    throw new Error('Invalid source data format');
  }

  return sourceData.map(item => {
    let newItem = new ContentModel();

    try {
      switch (sourceCMS) {
        case 'WordPress':
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
          if (item.acf) {
            newItem.customFields = item.acf;
          }

          // Handle featured image
          if (item._embedded && item._embedded['wp:featuredmedia']) {
            newItem.featuredImage = {
              url: item._embedded['wp:featuredmedia'][0].source_url,
              altText: item._embedded['wp:featuredmedia'][0].alt_text,
              caption: item._embedded['wp:featuredmedia'][0].caption.rendered
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
              twitterImage: item.yoast_seo.twitter_image
            });
          }
          break;
        case 'Drupal':
          // Add Drupal-specific mappings here
          break;
        default:
          logger.warn(`Unknown CMS type: ${sourceCMS}`);
      }

      // Apply custom mappings if any
      if (customMappings) {
        Object.keys(customMappings).forEach(key => {
          newItem[key] = item[customMappings[key]];
        });
      }

      return newItem;
    } catch (error) {
      logger.error(`Error mapping item: ${error.message}`, { item });
      return null;
    }
  }).filter(item => item !== null);
}

module.exports = { mapToIntermediate };