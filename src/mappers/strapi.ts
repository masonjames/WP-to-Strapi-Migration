// src/connectors/strapi.ts

import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import fs from 'fs-extra';
import { logger } from '../utils/logger';
import { ContentModel } from '../models/content';

interface StrapiMediaResponse {
  id: number;
  url: string;
  [key: string]: any;
}

/**
 * Uploads media to Strapi.
 * @param filePath - The local file path to the media file.
 * @param apiUrl - The base URL of the Strapi instance.
 * @param apiKey - The API key for authentication.
 * @returns A promise that resolves to the uploaded media data.
 */
async function uploadMedia(
  filePath: string,
  apiUrl: string,
  apiKey: string
): Promise<StrapiMediaResponse> {
  const formData = new FormData();
  formData.append('files', fs.createReadStream(filePath));

  const response: AxiosResponse = await axios.post(`${apiUrl}/upload`, formData, {
    headers: {
      ...formData.getHeaders(),
      Authorization: `Bearer ${apiKey}`,
    },
  });
  return response.data[0]; // Assuming single file upload
}

/**
 * Ensures that a relation (category or tag) exists in Strapi.
 * @param name - The name of the relation.
 * @param apiUrl - The base URL of the Strapi instance.
 * @param apiKey - The API key for authentication.
 * @param type - The type of relation ('categories' or 'tags').
 * @returns A promise that resolves to the ID of the relation.
 */
async function ensureRelationExists(
  name: string,
  apiUrl: string,
  apiKey: string,
  type: 'categories' | 'tags'
): Promise<number> {
  try {
    const response: AxiosResponse = await axios.get(
      `${apiUrl}/${type}?filters[name][$eq]=${encodeURIComponent(name)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    if (response.data.data.length > 0) {
      return response.data.data[0].id;
    } else {
      const createResponse: AxiosResponse = await axios.post(
        `${apiUrl}/${type}`,
        { data: { name } },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      return createResponse.data.data.id;
    }
  } catch (error) {
    logger.error(`Error ensuring ${type} exists: ${name}`, error.message);
    throw error;
  }
}

/**
 * Posts content to Strapi.
 * @param contentItem - The content item to post.
 * @param apiUrl - The base URL of the Strapi instance.
 * @param apiKey - The API key for authentication.
 * @param contentType - The content type (e.g., 'posts').
 * @returns A promise that resolves to the posted content data.
 */
export async function postToStrapi(
  contentItem: ContentModel,
  apiUrl: string,
  apiKey: string,
  contentType: string
): Promise<any> {
  try {
    // Handle media upload
    if (contentItem.featuredImage?.localPath) {
      const mediaData = await uploadMedia(contentItem.featuredImage.localPath, apiUrl, apiKey);
      contentItem.featuredImage.id = mediaData.id;
    }

    // Handle categories
    if (contentItem.categories) {
      const categoryIds = [];
      for (const category of contentItem.categories) {
        const categoryId = await ensureRelationExists(category.name, apiUrl, apiKey, 'categories');
        categoryIds.push(categoryId);
      }
      contentItem.categories = categoryIds;
    }

    // Handle tags
    if (contentItem.tags) {
      const tagIds = [];
      for (const tag of contentItem.tags) {
        const tagId = await ensureRelationExists(tag.name, apiUrl, apiKey, 'tags');
        tagIds.push(tagId);
      }
      contentItem.tags = tagIds;
    }

    // Post content
    const response: AxiosResponse = await axios.post(
      `${apiUrl}/${contentType}`,
      { data: contentItem },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    logger.info(`Successfully posted content ID: ${contentItem.id}`);
    return response.data;
  } catch (error) {
    logger.error(`Error posting content ID: ${contentItem.id}`, error.message);
    throw error;
  }
}