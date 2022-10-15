const winston = require('winston');
const expressWinston = require('express-winston');

format = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.json()
)

dateStr = new Date().toISOString()
    .replace(/T/, '_').substr(0, 19).replaceAll(":", "-")

function transport(path, level) {
    return new winston.transports.File({
        filename: `/societies/cumc/cumc-org-uk/logs/${path.replace('%DATE%', dateStr)}`,
        options: {mode: 0o660}, // File permissions
        level: level ? level : 'info',
        handleExceptions: true,
        handleRejections: true
    });
}

let expressLogger = expressWinston.logger({
    transports: [
        transport('access_%DATE%.log')
    ],
    format: format,
    msg: "HTTP {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
});

const logger = winston.createLogger({
    transports: [
        transport('application_%DATE%.log'),
        transport('exceptions_%DATE%.log', 'error')
    ],
    format: format
});

module.exports = {
    logger: logger,
    expressLogger: expressLogger
}