const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { logger } = require('../utils/logger');

async function uploadMedia(filePath, apiUrl, apiKey) {
  const formData = new FormData();
  formData.append('files', fs.createReadStream(filePath));

  const response = await axios.post(
    `${apiUrl}/upload`,
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  );
  return response.data[0]; // Assuming single file upload
}

async function ensureRelationExists(name, apiUrl, apiKey, type) {
  // Check if the relation (category/tag) exists
  // If not, create it
  // Return the ID
  try {
    const response = await axios.get(
      `${apiUrl}/${type}?filters[name][$eq]=${encodeURIComponent(name)}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );
    if (response.data.data.length > 0) {
      return response.data.data[0].id;
    } else {
      // Create the relation
      const createResponse = await axios.post(
        `${apiUrl}/${type}`,
        {
          data: { name },
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
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

async function postToStrapi(contentItem, apiUrl, apiKey) {
  try {
    // Handle media upload
    if (contentItem.featured_image && contentItem.featured_image.localPath) {
      const mediaData = await uploadMedia(contentItem.featured_image.localPath, apiUrl, apiKey);
      // Replace local path with media ID
      contentItem.featured_image = mediaData.id;
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
    const response = await axios.post(
      `${apiUrl}/posts`, // Adjust the endpoint based on your content type
      { data: contentItem },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
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

module.exports = { postToStrapi };