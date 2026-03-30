const {Rental, validate: validateRental} = require('../models/rental')
const {Movie}= require('../models/movie')
const {Customer} = require(('../models/customer'))
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/async');

const mongoose = require('mongoose')

const express = require('express');
const router = express.Router();


router.get('/', auth, asyncHandler(async (req,res)=>{
  const rentals = await Rental.find().sort('-dateOut');
  res.send(rentals);
}));

router.post('/', auth, validate(validateRental), asyncHandler(async (req,res)=>{
  const customer = await Customer.findById(req.body.customerId);
  if(!customer) return res.status(400).send('Invalid customer')

  const movie = await Movie.findById(req.body.movieId);
  if(!movie) return res.status(400).send('Invalid movie')

  if(movie.numberInStock === 0 ) return res.status(400).send('Movie not in stock');

  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate
    }
  })

  await rental.save();

  movie.numberInStock--;
  await movie.save();

  res.send(rental);
}))

router.get('/:id', auth, asyncHandler(async (req,res)=>{
  const rental = await Rental.findById(req.params.id);
  
  if(!rental) return res.status(404).send('Rental with this ID was not found')
  res.send(rental);
}));

module.exports = router;