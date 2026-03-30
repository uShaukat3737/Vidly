const mongoose = require('mongoose');
const winston = require('winston');
const config = require('config');


module.exports= function(){
  mongoose.connect(config.get('db'))
    .then(() => winston.info(`connected to MongoDB at ${config.get('db')}...`));

}
