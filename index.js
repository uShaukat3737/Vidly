const express = require('express');
const winston = require('winston');
const app = express();

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
if (app.get('env') === 'production') {
  require('./startup/prod')(app);
}


const port = process.env.PORT ||  3001;
const server = app.listen(port, ()=> winston.info(`listening on port ${port}`));

module.exports = server;  // Exporting for testing purposes