// src/connectors/drupal.ts

import axios, { AxiosResponse } from 'axios';
import { authenticateDrupal, DrupalAuth } from '../utils/auth';
import { logger } from '../utils/logger';

interface DrupalArticle {
  id: string;
  type: string;
  attributes: {
    title: string;
    body: { value: string };
    created: string;
    changed: string;
    [key: string]: any;
  };
  relationships: {
    field_image?: {
      data: {
        id: string;
        type: string;
      };
      links: {
        related: {
          href: string;
        };
      };
    };
    [key: string]: any;
  };
  featuredImage?: any;
}

/**
 * Fetches content from a Drupal site.
 * @param siteUrl - The base URL of the Drupal site.
 * @param auth - Optional authentication credentials.
 * @returns A promise that resolves to an array of Drupal articles.
 */
export async function fetchDrupalContent(
  siteUrl: string,
  auth: DrupalAuth | null
): Promise<DrupalArticle[]> {
  try {
    const apiUrl = `${siteUrl}/jsonapi/node/article`;
    const headers = auth ? await authenticateDrupal(siteUrl, auth) : {};

    const response: AxiosResponse = await axios.get(apiUrl, { headers });
    const articles: DrupalArticle[] = response.data.data;

    const articlesWithMedia = await Promise.all(
      articles.map(async (article) => {
        if (article.relationships.field_image?.data) {
          const mediaResponse: AxiosResponse = await axios.get(
            `${siteUrl}${article.relationships.field_image.links.related.href}`,
            { headers }
          );
          article.featuredImage = mediaResponse.data.data;
        }
        return article;
      })
    );

    logger.info('Drupal content and media fetched successfully.');
    return articlesWithMedia;
  } catch (error) {
    logger.error('Error fetching Drupal content:', error);
    throw error;
  }
}