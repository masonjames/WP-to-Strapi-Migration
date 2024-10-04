// src/utils/logger.ts

import { createLogger, format, transports, Logger } from 'winston';

const { combine, timestamp, printf, colorize, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger: Logger = createLogger({
  level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }), // <-- use errors format
    process.env.NODE_ENV !== 'production' ? colorize() : format.uncolorize(),
    logFormat
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: combine(colorize(), logFormat),
    })
  );
}