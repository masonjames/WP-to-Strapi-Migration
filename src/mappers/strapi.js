const { logger } = require('../utils/logger');

function mapToStrapi(intermediateContent) {
  logger.info('Mapping content to Strapi format');

  return intermediateContent.map(item => {
    try {
      return {
        title: item.title,
        content: item.body,
        slug: item.slug,
        author: item.author,
        published_at: item.createdAt,
        updated_at: item.updatedAt,
        post_type: item.postType,
        categories: item.categories ? item.categories.map(category => ({
          name: typeof category === 'string' ? category : String(category)
        })) : [],
        tags: item.tags ? item.tags.map(tag => ({
          name: typeof tag === 'string' ? tag : String(tag)
        })) : [],
        featured_image: item.featuredImage ? {
          url: item.featuredImage.url,
          alternativeText: item.featuredImage.altText,
          caption: item.featuredImage.caption,
          width: item.featuredImage.width,
          height: item.featuredImage.height
        } : null,
        seo: item.seo ? {
          metaTitle: item.seo.title,
          metaDescription: item.seo.metaDesc,
          metaRobots: `${item.seo.metaRobotsNoindex},${item.seo.metaRobotsNofollow}`,
          canonicalURL: item.seo.canonical,
          focusKeyword: item.seo.focusKeyword,
          metaKeywords: item.seo.metaKeywords,
          metaSocial: [
            {
              socialNetwork: 'Facebook',
              title: item.seo.opengraphTitle,
              description: item.seo.opengraphDescription,
              image: item.seo.opengraphImage
            },
            {
              socialNetwork: 'Twitter',
              title: item.seo.twitterTitle,
              description: item.seo.twitterDescription,
              image: item.seo.twitterImage
            }
          ],
          structuredData: item.seo.schema
        } : null,
        custom_fields: item.customFields
      };
    } catch (error) {
      logger.error(`Error mapping item to Strapi format: ${error.message}`, { item });
      return null;
    }
  }).filter(item => item !== null);
}

module.exports = { mapToStrapi };