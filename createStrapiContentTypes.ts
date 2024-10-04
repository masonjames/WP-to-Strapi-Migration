// createStrapiContentTypes.ts

import fs from 'fs-extra';
import path from 'path';
import { logger } from './src/utils/logger';

require('dotenv').config();

interface ContentType {
  name: string;
  singularName: string;
  pluralName: string;
  displayName: string;
  description: string;
  attributes: Record<string, any>;
}

const strapiDir = path.join(__dirname, '..', 'strapi', 'wp2strapi');
const apiDir = path.join(strapiDir, 'src', 'api');

const contentTypes: ContentType[] = [
  // ... same as before
];

/**
 * Creates a content type in Strapi by writing the schema.json file.
 * @param apiPath - The path to the Strapi API directory.
 * @param contentType - The content type definition.
 */
function createContentType(apiPath: string, contentType: ContentType): void {
  const { name, singularName, pluralName, displayName, description, attributes } = contentType;

  const modelDir = path.join(apiPath, name, 'content-types', name);
  const schemaFile = path.join(modelDir, 'schema.json');

  if (fs.existsSync(schemaFile)) {
    logger.info(`Content type "${displayName}" already exists. Skipping creation.`);
    return;
  }

  fs.mkdirSync(modelDir, { recursive: true });

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

  fs.writeFileSync(schemaFile, JSON.stringify(schema, null, 2), 'utf8');
  logger.info(`Created content type: ${displayName}`);
}

/**
 * Main function to create all defined content types.
 */
function main(): void {
  if (!fs.existsSync(strapiDir)) {
    logger.error(`Strapi directory not found at path: ${strapiDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(apiDir)) {
    logger.error(`API directory not found at path: ${apiDir}`);
    process.exit(1);
  }

  contentTypes.forEach((ct) => {
    createContentType(apiDir, ct);
  });

  logger.info('All content types processed successfully.');
  logger.info('Please restart your Strapi server to apply the new content types.');
}

main();