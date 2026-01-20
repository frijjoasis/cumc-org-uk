import winston from 'winston';
import expressWinston from 'express-winston';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const format = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const dateStr = new Date()
  .toISOString()
  .replace(/T/, '_')
  .slice(0, 19)
  .replaceAll(':', '-');

function getTransport(filename: string, level?: string): winston.transports.FileTransportInstance {
  const logDir = process.env.NODE_ENV === 'development'
    ? path.join(__dirname, 'logs')
    : '/societies/cumc/cumc-org-uk/logs';

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  return new winston.transports.File({
    filename: path.join(logDir, filename.replace('%DATE%', dateStr)),
    options: { mode: 0o660 }, 
    level: level || 'info',
    handleExceptions: true,
    handleRejections: true,
  });
}

const expressLogger = expressWinston.logger({
  transports: [getTransport('access_%DATE%.log')],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
  meta: true,
  msg: 'HTTP {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}',
  expressFormat: true,
  colorize: true,
});

const transports: winston.transport[] = [
  getTransport('application_%DATE%.log'),
  getTransport('exceptions_%DATE%.log', 'error'),
];

if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

const logger = winston.createLogger({
  level: 'info',
  transports: transports,
  format: format,
  exitOnError: false,
});

export { logger, expressLogger };