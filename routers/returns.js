const express = require('express');
const Joi = require('joi');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const { Movie } = require('../models/movie');
const { Rental, validateReturn } = require('../models/rental');
const validate = require('../middleware/validate');


router.post('/', auth, validate(validateReturn), asyncHandler(async (req, res) => {

  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental) return res.status(404).send('Rental not found');

  if (rental.dateReturned) return res.status(400).send('Return already processed');


  rental.return();

  await rental.save();

  const movie = await Movie.findById(req.body.movieId);
  movie.numberInStock++;
  await movie.save();

  res.send(rental);
}));

module.exports = router;
