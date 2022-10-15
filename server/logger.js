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
        filename: `/societies/cumc/cumc-org-uk/logs/${path}`,
        options: {mode: 0o660}, // File permissions
        datePattern: 'YYYY-MM-DD',
        auditFile: '/societies/cumc/cumc-org-uk/logs/audit.json',
        level: level ? level : 'info',
        handleExceptions: true,
        handleRejections: true,
        maxSize: '50m',
        maxFiles: '14d'
    });
}

transports = [transport('access-%DATE%.log'),
    transport('application-%DATE%.log'),
    transport('exceptions-%DATE%.log', 'error')
]

let expressLogger = expressWinston.logger({
    transports: [
        transports[0]
    ],
    format: format,
    msg: "HTTP {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
});

const logger = winston.createLogger({
    transports: [
        transports[1],
        transports[2]
    ],
    format: format
});

transports.forEach(t => {
    t.on('new', function (newFilename) {
        let data = fs.readFileSync(newFilename);
        let fd = fs.openSync(newFilename, 'w+');
        let buffer = Buffer.from('_____PROCESS RESTART_____\n');
        fs.writeSync(fd, buffer, 0, buffer.length, 0); // Write new data
        fs.writeSync(fd, data, 0, data.length, buffer.length); // Append old data
        fs.close(fd);
    });
});

module.exports = {
    logger: logger,
    expressLogger: expressLogger
}