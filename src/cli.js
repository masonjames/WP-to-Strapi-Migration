const inquirer = require('inquirer');
const { generateMigrationPath, saveMigrationResult } = require('./index');
const { logger } = require('./utils/logger');

async function runCLI() {
  const answers = await inquirer.prompt([
    // ... existing prompts ...
    {
      type: 'input',
      name: 'strapiUrl',
      message: 'Enter your Strapi instance URL (e.g., http://localhost:1337):',
      when: answers => answers.destinationCMS === 'Strapi',
      validate: input => input.trim() !== '' || 'Strapi URL is required',
    },
    {
      type: 'input',
      name: 'strapiApiKey',
      message: 'Enter your Strapi API key:',
      when: answers => answers.destinationCMS === 'Strapi',
      validate: input => input.trim() !== '' || 'Strapi API key is required',
    },
    // ... existing prompts ...
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

    // Save migration result
    await saveMigrationResult(migrationPath);

    logger.info('Migration completed successfully.');
  } catch (error) {
    logger.error('Migration failed:', error);
  }
}

runCLI();