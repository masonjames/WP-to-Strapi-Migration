// src/server.ts

import express from 'express';
import { generateMigrationPath } from './index';
import { logger } from './utils/logger';

const app = express();
app.use(express.json());

app.post('/migrate', async (req, res) => {
  try {
    const migrationPath = await generateMigrationPath(req.body);
    res.status(200).json(migrationPath);
  } catch (error) {
    logger.error('Migration failed:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});