const log4js = require('log4js');

log4js.configure({
  appenders: {
    file: { type: 'file', filename: 'logproject' },
    console: { type: 'console' }
  },
  categories: {
    default: { appenders: ['file', 'console'], level: 'debug' }
  }
});

const logger = log4js.getLogger();

module.exports = logger;
