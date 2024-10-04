// src/mappers/jamstack.ts

import { ContentModel } from '../models/content';

/**
 * Maps intermediate content to Jamstack format.
 * @param intermediateContent - The intermediate content array.
 * @returns An array of content formatted for Jamstack.
 */
export function mapToJamstack(intermediateContent: ContentModel[]): any[] {
  return intermediateContent.map((item) => {
    return {
      frontmatter: {
        title: item.title,
        date: item.createdAt,
        author: item.author,
        slug: item.slug,
        categories: item.categories,
        tags: item.tags,
        featured_image: item.featuredImage
          ? {
              src: item.featuredImage.url,
              alt: item.featuredImage.altText,
            }
          : null,
        seo: item.seo,
      },
      content: item.body,
    };
  });
}