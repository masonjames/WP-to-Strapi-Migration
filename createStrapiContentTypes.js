const { createStrapiContentType } = require('../connectors/strapi-admin');

async function createPostContentType(apiUrl, apiKey) {
  const postType = {
    displayName: "Post",
    singularName: "post",
    pluralName: "posts",
    attributes: {
      title: { type: "string" },
      content: { type: "richtext" },
      slug: { type: "uid" },
      published_at: { type: "datetime" },
      featured_image: { type: "media", multiple: false, allowedTypes: ["images"] },
      categories: { type: "relation", relation: "manyToMany", target: "category" },
      tags: { type: "relation", relation: "manyToMany", target: "tag" },
      author: { type: "relation", relation: "oneToOne", target: "author" },
    }
  };

  return await createStrapiContentType(apiUrl, apiKey, postType);
}

async function createCategoryContentType(apiUrl, apiKey) {
  const categoryType = {
    displayName: "Category",
    singularName: "category",
    pluralName: "categories",
    attributes: {
      name: { type: "string" }
    }
  };

  return await createStrapiContentType(apiUrl, apiKey, categoryType);
}

// Similarly, you would create content types for tags, pages, and authors.

module.exports = { createPostContentType, createCategoryContentType };