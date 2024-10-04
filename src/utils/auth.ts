// src/utils/auth.ts

import axios from 'axios';
import { logger } from './logger';

export interface WordPressAuth {
  username: string;
  password: string;
}

export interface DrupalAuth {
  username: string;
  password: string;
}

/**
 * Authenticates with a WordPress site and returns a JWT token.
 * @param siteUrl - The base URL of the WordPress site.
 * @param auth - The authentication credentials.
 * @returns A promise that resolves to a JWT token string.
 */
export async function authenticateWordPress(
  siteUrl: string,
  auth: WordPressAuth
): Promise<string> {
  try {
    const response = await axios.post(`${siteUrl}/wp-json/jwt-auth/v1/token`, {
      username: auth.username,
      password: auth.password,
    });
    return response.data.token;
  } catch (error) {
    logger.error('WordPress authentication failed:', error.message);
    throw error;
  }
}

/**
 * Authenticates with a Drupal site and returns headers.
 * @param siteUrl - The base URL of the Drupal site.
 * @param auth - The authentication credentials.
 * @returns A promise that resolves to an object containing headers.
 */
export async function authenticateDrupal(
  siteUrl: string,
  auth: DrupalAuth
): Promise<Record<string, string>> {
  // Implement Drupal authentication logic
  throw new Error('Drupal authentication not implemented.');
}