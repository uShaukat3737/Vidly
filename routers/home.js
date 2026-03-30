const express = require('express');
const router = express.Router(); 

//welcome page
router.get('/', (req,res)=>{
  res.send('Welcome to movie selector!!!!');
});

module.exports= router;

