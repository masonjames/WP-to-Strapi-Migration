// src/connectors/wordpress.ts

import axios, { AxiosResponse } from 'axios';
import { authenticateWordPress, WordPressAuth } from '../utils/auth';
import { logger } from '../utils/logger';

interface WordPressPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  type: string;
  title: { rendered: string };
  content: { rendered: string };
  categories: number[];
  tags: number[];
  acf?: any;
  yoast_seo?: any;
  _embedded?: any;
  [key: string]: any;
}

export async function fetchWordPressContent(
  siteUrl: string,
  auth: WordPressAuth | null,
  postTypes: string[] = ['posts', 'pages']
): Promise<WordPressPost[]> {
  try {
    siteUrl = normalizeUrl(siteUrl);

    const headers = await getHeaders(siteUrl, auth);

    const allContent: WordPressPost[] = [];

    for (const postType of postTypes) {
      const content = await fetchPostTypeContent(siteUrl, postType, headers);
      allContent.push(...content);
    }

    logger.info(`Total content items fetched: ${allContent.length}`);

    await enrichContentWithYoastSEO(siteUrl, allContent, headers);
    await enrichContentWithACF(siteUrl, allContent, headers);

    return allContent;
  } catch (error) {
    logger.error('Error fetching WordPress content:', error);
    throw error;
  }
}

function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
}

async function getHeaders(siteUrl: string, auth: WordPressAuth | null): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Expose-Headers': 'x-wp-total, x-wp-totalpages',
  };

  if (auth) {
    const token = await authenticateWordPress(siteUrl, auth);
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

async function fetchPostTypeContent(
  siteUrl: string,
  postType: string,
  headers: Record<string, string>
): Promise<WordPressPost[]> {
  const baseUrl = `${siteUrl}/wp-json/wp/v2/${postType}`;
  logger.info(`Fetching content for post type: ${postType}`);

  try {
    const initialResponse: AxiosResponse = await axios.get(`${baseUrl}?per_page=100`, { headers });
    const totalPages = parseInt(initialResponse.headers['x-wp-totalpages']) || 1;

    const pagePromises = [];
    for (let page = 1; page <= totalPages; page++) {
      pagePromises.push(axios.get(`${baseUrl}?per_page=100&page=${page}`, { headers }));
    }

    const pageResponses = await Promise.all(pagePromises);
    const content = pageResponses.flatMap((response) => response.data);

    logger.info(`Fetched ${content.length} items for ${postType}`);
    return content;
  } catch (error) {
    handleFetchError(error, postType);
    return [];
  }
}

async function enrichContentWithYoastSEO(
  siteUrl: string,
  contentItems: WordPressPost[],
  headers: Record<string, string>
): Promise<void> {
  try {
    const yoastUrl = `${siteUrl}/wp-json/yoast/v1/get_head?url=${siteUrl}`;
    const yoastResponse = await axios.get(yoastUrl, { headers });
    const yoastData = yoastResponse.data;

    contentItems.forEach((post) => {
      post.yoast_seo = yoastData[post.link] || {};
    });

    logger.info('Enriched content with Yoast SEO data');
  } catch (error) {
    logger.warn('Yoast SEO data not available:', error.message);
  }
}

async function enrichContentWithACF(
  siteUrl: string,
  contentItems: WordPressPost[],
  headers: Record<string, string>
): Promise<void> {
  try {
    const acfUrl = `${siteUrl}/wp-json/acf/v3/posts`;
    const acfResponse = await axios.get(acfUrl, { headers });
    const acfData = acfResponse.data;

    contentItems.forEach((post) => {
      const acfFields = acfData.find((acf: any) => acf.id === post.id);
      post.acf = acfFields ? acfFields.acf : {};
    });

    logger.info('Enriched content with ACF data');
  } catch (error) {
    logger.warn('ACF data not available:', error.message);
  }
}

function handleFetchError(error: any, postType: string): void {
  if (axios.isAxiosError(error) && error.response) {
    const status = error.response.status;
    switch (status) {
      case 401:
        logger.error(`Authentication required for post type ${postType}.`);
        break;
      case 404:
        logger.warn(`Post type ${postType} not found. Skipping.`);
        break;
      case 502:
        logger.warn(`Server error when fetching ${postType}. Retrying...`);
        // Implement retry logic if necessary
        break;
      default:
        logger.warn(`Error fetching ${postType}: ${error.message}`);
    }
  } else {
    logger.error(`Unexpected error fetching ${postType}: ${error.message}`);
  }
}