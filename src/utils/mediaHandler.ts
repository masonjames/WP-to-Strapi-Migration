// src/utils/mediaHandler.ts

import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { logger } from './logger';

/**
 * Downloads media from a given URL to the specified destination path.
 * @param url - The URL of the media to download.
 * @param destinationPath - The local file path to save the downloaded media.
 */
export async function downloadMedia(url: string, destinationPath: string): Promise<void> {
  try {
    const response = await axios.get(url, { responseType: 'stream' });

    await fs.ensureDir(path.dirname(destinationPath));

    const writer = fs.createWriteStream(destinationPath);
    response.data.pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    logger.info(`Media downloaded to ${destinationPath}`);
  } catch (error) {
    logger.error(`Failed to download media from ${url}: ${error.message}`);
    throw error;
  }
}