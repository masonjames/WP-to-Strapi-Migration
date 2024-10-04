// src/utils/config.ts

import { parse } from 'dotenv';
import fs from 'fs-extra';
import path from 'path';
import { logger } from './logger';

interface SiteConfig {
  sourceCMS: string;
  wordpressUrl: string;
  strapiUrl: string;
  strapiApiKey: string;
  auth: { username: string; password: string } | null;
  customMappings: Record<string, string>;
  includeMedia: boolean;
  performSEOAnalysis: boolean;
  slug: string;
}

/**
 * Parses the .env file to extract site configurations.
 * @returns An array of site configuration objects.
 */
export function parseSiteConfigs(): SiteConfig[] {
  const envPath = path.resolve(__dirname, '../../.env');
  if (!fs.existsSync(envPath)) {
    logger.error('.env file not found. Please create one based on .env.example.');
    process.exit(1);
  }

  const envConfig = parse(fs.readFileSync(envPath));

  const siteCount = parseInt(envConfig.SITE_COUNT, 10) || 0;
  const sites: SiteConfig[] = [];

  for (let i = 1; i <= siteCount; i++) {
    const wordpressUrl = envConfig[`SITE_${i}_WORDPRESS_URL`];
    const strapiUrl = envConfig[`SITE_${i}_STRAPI_URL`];
    const strapiApiKey = envConfig[`SITE_${i}_STRAPI_API_KEY`];
    const username = envConfig[`SITE_${i}_USERNAME`];
    const password = envConfig[`SITE_${i}_PASSWORD`];

    if (!wordpressUrl || !strapiUrl || !strapiApiKey) {
      logger.warn(`Incomplete configuration for site ${i}. Skipping this site.`);
      continue;
    }

    sites.push({
      sourceCMS: 'WordPress',
      wordpressUrl,
      strapiUrl,
      strapiApiKey,
      auth: username && password ? { username, password } : null,
      customMappings: {},
      includeMedia: envConfig.INCLUDE_MEDIA === 'true',
      performSEOAnalysis: envConfig.PERFORM_SEO_ANALYSIS === 'true',
      slug: `site${i}`,
    });
  }

  return sites;
}