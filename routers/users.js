const auth = require('../middleware/auth');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt')
const {User, validate: validateUser} = require('../models/user');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.post('/', validate(validateUser), asyncHandler(async (req,res) => {
  
  let user = await User.findOne({ email: req.body.email})
  if(user) return res.status(400).send('user already registered')

  user = new User(_.pick(req.body, [ 'name', 'email', 'password']));
  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();

  res.header('x-auth-token',token).send(_.pick(user,[ '_id','name','email' ]));
}))

router.get('/me', auth, asyncHandler(async(req,res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.send(user); 
}));

module.exports = router;