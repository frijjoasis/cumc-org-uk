const winston = require('winston');
require('winston-daily-rotate-file');

let transport = new (winston.transports.DailyRotateFile)({
    filename: '/societies/cumc/cumc-org-uk/logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
});

let logger = winston.createLogger({
    transports: [
        transport
    ]
});

module.exports = logger;