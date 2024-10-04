// src/cli.ts

import inquirer from 'inquirer';
import { generateMigrationPath, saveMigrationResult } from './index';
import { logger } from './utils/logger';

async function runCLI(): Promise<void> {
  const answers = await inquirer.prompt([
    // ... same as before, with type definitions
  ]);

  // Prepare authentication object if required
  if (answers.requiresAuth) {
    answers.auth = {
      username: answers.username,
      password: answers.password,
    };
  } else {
    answers.auth = null;
  }

  try {
    const migrationPath = await generateMigrationPath(answers);
    logger.info('Migration Path Generated:', migrationPath);

    if (answers.includeMedia) {
      logger.info('Media files have been downloaded and included in the migration path.');
    }

    if (answers.performSEOAnalysis) {
      logger.info('SEO Analysis Results:', migrationPath.seoAnalysis);
    }

    // Save migration result
    await saveMigrationResult(migrationPath);

    logger.info('Migration completed successfully.');
  } catch (error) {
    logger.error('Migration failed:', error);
  }
}

runCLI();