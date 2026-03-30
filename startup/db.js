const mongoose = require('mongoose');
const winston = require('winston');
const config = require('config');


module.exports= function(){
  const db = config.get('db');
  mongoose.connect(db)
    .then(() => winston.info(`connected to MongoDB...`))
    .catch(err => {
      winston.error(`Failed to connect to MongoDB: ${err.message}`);
      process.exit(1);
    });

}
