const { MONGODB_URI } = require('./config');

require('mongoose').connect(MONGODB_URI, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true });
require('./BinanceTelegramBot');
require('./server');