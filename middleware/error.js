const winston = require('winston');

module.exports=function(err,req,res,next){
  
  //winston.log(err, err.message);
  winston.error(err.message, err);

  //error
  //warn 
  //info
  //verbose 
  //debug 
  //silly

  res.status(500).send('Something went wrong.');
}