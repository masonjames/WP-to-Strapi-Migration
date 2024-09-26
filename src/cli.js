const inquirer = require('inquirer');
const { generateMigrationPath } = require('./index');
const { logger } = require('./utils/logger');

async function runCLI() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'siteUrl',
      message: 'Enter the source CMS URL:',
      validate: input => input.trim() !== '' || 'URL is required'
    },
    {
      type: 'list',
      name: 'sourceCMS',
      message: 'Select the source CMS:',
      choices: ['WordPress', 'Drupal']
    },
    {
      type: 'list',
      name: 'destinationCMS',
      message: 'Select the destination CMS:',
      choices: ['Strapi', 'Jamstack']
    },
    {
      type: 'confirm',
      name: 'needsAuth',
      message: 'Does the source CMS require authentication?',
      default: false
    },
    {
      type: 'input',
      name: 'username',
      message: 'Enter your username:',
      when: answers => answers.needsAuth
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter your password:',
      when: answers => answers.needsAuth
    },
    {
      type: 'confirm',
      name: 'includeMedia',
      message: 'Would you like to include media in the migration?',
      default: true
    },
    {
      type: 'confirm',
      name: 'performSEOAnalysis',
      message: 'Would you like to perform SEO analysis?',
      default: true
    }
  ]);

  try {
    const migrationPath = await generateMigrationPath(answers);
    logger.info('Migration Path Generated:', migrationPath);
    
    if (answers.includeMedia) {
      logger.info('Media files have been downloaded and included in the migration path.');
    }
    
    if (answers.performSEOAnalysis) {
      logger.info('SEO Analysis Results:', migrationPath.seoAnalysis);
    }
  } catch (error) {
    logger.error('Migration failed:', error);
  }
}

runCLI();