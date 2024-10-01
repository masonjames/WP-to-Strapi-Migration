const inquirer = require('inquirer');
const { generateMigrationPath, saveMigrationResult } = require('./logger');
const { logger } = require('./utils/logger');

async function runCLI() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'sourceCMS',
      message: 'Select your source CMS:',
      choices: ['WordPress', 'Drupal'],
      default: 'WordPress',
    },
    {
      type: 'input',
      name: 'siteUrl',
      message: 'Enter your WordPress site URL (e.g., https://example.com):',
      when: (answers) => answers.sourceCMS === 'WordPress',
      validate: (input) => input.trim() !== '' || 'Site URL is required',
    },
    {
      type: 'confirm',
      name: 'requiresAuth',
      message: 'Does your WordPress site require authentication?',
      default: false,
    },
    {
      type: 'input',
      name: 'username',
      message: 'Enter your WordPress username:',
      when: (answers) => answers.requiresAuth,
      validate: (input) => input.trim() !== '' || 'Username is required',
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter your WordPress password:',
      when: (answers) => answers.requiresAuth,
      validate: (input) => input.trim() !== '' || 'Password is required',
    },
    {
      type: 'confirm',
      name: 'includeMedia',
      message: 'Do you want to include media files?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'performSEOAnalysis',
      message: 'Do you want to perform SEO analysis?',
      default: true,
    },
    {
      type: 'list',
      name: 'destinationCMS',
      message: 'Select your destination CMS:',
      choices: ['Strapi', 'Jamstack'],
      default: 'Strapi',
    },
    {
      type: 'input',
      name: 'strapiUrl',
      message: 'Enter your Strapi instance URL (e.g., http://localhost:1337):',
      when: (answers) => answers.destinationCMS === 'Strapi',
      validate: (input) => input.trim() !== '' || 'Strapi URL is required',
    },
    {
      type: 'input',
      name: 'strapiApiKey',
      message: 'Enter your Strapi API key:',
      when: (answers) => answers.destinationCMS === 'Strapi',
      validate: (input) => input.trim() !== '' || 'Strapi API key is required',
    },
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