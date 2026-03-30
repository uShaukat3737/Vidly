const home = require ('../routers/home');
const genres = require ('../routers/genres');
const customers = require ('../routers/customers');
const movies = require ('../routers/movies');
const users = require ('../routers/users');
const rentals = require ('../routers/rentals');
const auth = require ('../routers/auth');
const returns = require ('../routers/returns');
const error = require('../middleware/error');
const express = require('express');

module.exports = function (app){
  app.use(express.json());
  app.use('/', home);
  app.use('/api/genres', genres);
  app.use('/api/customers', customers);
  app.use('/api/movies', movies);
  app.use('/api/users', users);
  app.use('/api/rentals', rentals);
  app.use('/api/auth', auth);
  app.use('/api/returns', returns);
  app.use( error );
}