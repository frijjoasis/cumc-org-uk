const fs = require('fs')
const winston = require('winston');
const expressWinston = require('express-winston');
require('winston-daily-rotate-file');

format = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.json()
)

function transport(path, level) {
    return new winston.transports.DailyRotateFile({
        stream: `/societies/cumc/cumc-org-uk/logs/${path}`,
        options: {mode: 0o660}, // File permissions
        datePattern: 'YYYY-MM-DD_HH-mm-ss',
        frequency: '24h',
        auditFile: '/societies/cumc/cumc-org-uk/logs/audit.json',
        level: level ? level : 'info',
        handleExceptions: true,
        handleRejections: true,
        maxSize: '50m',
        maxFiles: '14d'
    });
}

let expressLogger = expressWinston.logger({
    transports: [
        transport('access-%DATE%.log')
    ],
    format: format,
    msg: "HTTP {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
});

const logger = winston.createLogger({
    transports: [
        transport('application-%DATE%.log'),
        transport('exceptions-%DATE%.log', 'error')
    ],
    format: format
});

module.exports = {
    logger: logger,
    expressLogger: expressLogger
}