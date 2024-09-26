// File: createStrapiContentTypes.js

const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables

// Dynamically construct the absolute path to the Strapi project located in a sibling directory
const strapiDir = path.join(__dirname, '..', 'strapi', 'wp2strapi');
const apiDir = path.join(strapiDir, 'src', 'api');

const contentTypes = [
  {
    name: 'post',
    singularName: 'post',
    pluralName: 'posts',
    displayName: 'Post',
    description: 'Blog posts',
    attributes: {
      title: {
        type: 'string',
        required: true,
      },
      slug: {
        type: 'uid',
        targetField: 'title',
        unique: true,
      },
      content: {
        type: 'richtext',
      },
      excerpt: {
        type: 'text',
      },
      published_at: {
        type: 'datetime',
      },
      featured_image: {
        type: 'media', // Strapi v4 media field
        multiple: false,
        required: false,
      },
      categories: {
        type: 'relation',
        relation: 'manyToMany',
        target: 'api::category.category',
        mappedBy: 'posts',
      },
      tags: {
        type: 'relation',
        relation: 'manyToMany',
        target: 'api::tag.tag',
        mappedBy: 'posts',
      },
      author: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::author.author',
      },
      seo: {
        type: 'json',
      },
    },
  },
  {
    name: 'page',
    singularName: 'page',
    pluralName: 'pages',
    displayName: 'Page',
    description: 'Static pages',
    attributes: {
      title: {
        type: 'string',
        required: true,
      },
      slug: {
        type: 'uid',
        targetField: 'title',
        unique: true,
      },
      content: {
        type: 'richtext',
      },
      published_at: {
        type: 'datetime',
      },
      featured_image: {
        type: 'media',
        multiple: false,
        required: false,
      },
      author: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::author.author',
      },
      seo: {
        type: 'json',
      },
    },
  },
  {
    name: 'category',
    singularName: 'category',
    pluralName: 'categories',
    displayName: 'Category',
    description: 'Post categories',
    attributes: {
      name: {
        type: 'string',
        required: true,
        unique: true,
      },
      posts: {
        type: 'relation',
        relation: 'manyToMany',
        target: 'api::post.post',
        inversedBy: 'categories',
      },
    },
  },
  {
    name: 'tag',
    singularName: 'tag',
    pluralName: 'tags',
    displayName: 'Tag',
    description: 'Post tags',
    attributes: {
      name: {
        type: 'string',
        required: true,
        unique: true,
      },
      posts: {
        type: 'relation',
        relation: 'manyToMany',
        target: 'api::post.post',
        inversedBy: 'tags',
      },
    },
  },
  {
    name: 'author',
    singularName: 'author',
    pluralName: 'authors',
    displayName: 'Author',
    description: 'Content authors',
    attributes: {
      name: {
        type: 'string',
        required: true,
      },
      email: {
        type: 'email',
        required: true,
        unique: true,
      },
      bio: {
        type: 'text',
      },
      posts: {
        type: 'relation',
        relation: 'oneToMany',
        target: 'api::post.post',
        inversedBy: 'author',
      },
    },
  },
];

/**
 * Creates a content type in Strapi by writing the schema.json file.
 * @param {string} apiPath - The path to the Strapi API directory.
 * @param {Object} contentType - The content type definition.
 */
function createContentType(apiPath, contentType) {
  const { name, singularName, pluralName, displayName, description, attributes } = contentType;

  const modelDir = path.join(apiPath, name, 'content-types', name);
  const schemaFile = path.join(modelDir, 'schema.json');

  // Check if the content type already exists to prevent overwriting
  if (fs.existsSync(schemaFile)) {
    console.log(`Content type "${displayName}" already exists. Skipping creation.`);
    return;
  }

  // Create directories
  fs.mkdirSync(modelDir, { recursive: true });

  // Define schema structure
  const schema = {
    kind: 'collectionType',
    collectionName: pluralName,
    info: {
      singularName,
      pluralName,
      displayName,
      description,
    },
    options: {
      draftAndPublish: false,
    },
    attributes,
  };

  // Write schema.json
  fs.writeFileSync(schemaFile, JSON.stringify(schema, null, 2), 'utf8');
  console.log(`Created content type: ${displayName}`);
}

/**
 * Main function to create all defined content types.
 */
function main() {
  // Verify Strapi directory exists
  if (!fs.existsSync(strapiDir)) {
    console.error(`Strapi directory not found at path: ${strapiDir}`);
    console.error('Please ensure the path is correct and the Strapi project exists.');
    process.exit(1);
  }

  // Verify API directory exists
  if (!fs.existsSync(apiDir)) {
    console.error(`API directory not found at path: ${apiDir}`);
    console.error('Please ensure the Strapi project structure is correct.');
    process.exit(1);
  }

  contentTypes.forEach((ct) => {
    createContentType(apiDir, ct);
  });

  console.log('All content types processed successfully.');

  // Inform the user to restart Strapi
  console.log('Please restart your Strapi server to apply the new content types.');
}

main();