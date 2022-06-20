const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.simple(),
    winston.format.timestamp(),
    winston.format.prettyPrint()
  ),
  defaultMeta: { service: 'telegram' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: './error.log', level: 'error' }),
    new winston.transports.File({ filename: './combined.log' }),
  ],
});

module.exports = logger;