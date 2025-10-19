import winston from 'winston';
import expressWinston from 'express-winston';
import fs from 'fs';

const format = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.json()
);

const dateStr = new Date()
  .toISOString()
  .replace(/T/, '_')
  .substr(0, 19)
  .replaceAll(':', '-');

function transport(path: string, level?: string): winston.transports.FileTransportInstance {
  const logDir =
    process.env.NODE_ENV === 'development'
      ? `${__dirname}/logs`
      : `/societies/cumc/cumc-org-uk/logs`;

  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  return new winston.transports.File({
    filename: `${logDir}/${path.replace('%DATE%', dateStr)}`,
    options: { mode: 0o660 }, // File permissions
    level: level ? level : 'info',
    handleExceptions: true,
    handleRejections: true,
  });
}

const expressLogger = expressWinston.logger({
  transports: [transport('access_%DATE%.log')],
  format: format,
  msg: 'HTTP {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}',
});

const transports: winston.transport[] = [
  transport('application_%DATE%.log'),
  transport('exceptions_%DATE%.log', 'error'),
];

// Add console transport in development
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
  transports: transports,
  format: format,
});

export { logger, expressLogger };
