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
    const logDir = process.env.NODE_ENV === 'development' ? 
        `${__dirname}/logs` : 
        `/societies/cumc/cumc-org-uk/logs`;
    
    // Create logs directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    return new winston.transports.File({
        filename: `${logDir}/${path.replace('%DATE%', dateStr)}`,
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

const transports = [
    transport('application_%DATE%.log'),
    transport('exceptions_%DATE%.log', 'error')
];

// Add console transport in development
if (process.env.NODE_ENV === 'development') {
    transports.push(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

const logger = winston.createLogger({
    transports: transports,
    format: format
});

module.exports = {
    logger: logger,
    expressLogger: expressLogger
}