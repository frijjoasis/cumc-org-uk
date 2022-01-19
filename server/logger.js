const winston = require('winston');
const expressWinston = require('express-winston');
require('winston-daily-rotate-file');

function transport(path, level) {
    return new winston.transports.DailyRotateFile({
        filename: `/societies/cumc/cumc-org-uk/logs/${path}`,
        options: {mode: 0o660}, // File permissions
        datePattern: 'YYYY-MM-DD-HH',
        auditFile: '/societies/cumc/cumc-org-uk/logs/audit.json',
        level: level ? level : 'info',
        maxSize: '50m',
        maxFiles: '14d'
    });
}

let expressLogger = expressWinston.logger({
    transports: [
        transport('access-%DATE%.log')
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    ),
    msg: "HTTP {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
});

const logger = winston.createLogger({
    transports: [
        transport('application-%DATE%.log'),
        transport('exceptions-%DATE%.log', 'error')
    ],
    exceptionHandlers: [
        transport('application-%DATE%.log'),
        transport('exceptions-%DATE%.log')
        // Log errors to both files
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    )
});

module.exports = {
    logger: logger,
    expressLogger: expressLogger
}