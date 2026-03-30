const express = require('express');
const mongoose = require('mongoose')

const {Movie, validate: validateMovie} = require('../models/movie');
const {Genre} = require('../models/genre');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/async');

const router = express.Router();

//show all movie list
router.get('/', asyncHandler(async (req,res)=>{
  const movies = await Movie.find().sort('name');
  res.send(movies);
}));

//output particular genre
router.get('/:id', asyncHandler(async (req,res)=>{
  const movie = await Movie.findById(req.params.id)
  if(!movie) return res.status(404).send('Movie with given ID not found not found');
  res.send(movie);
}));

//add genre
router.post('/', auth, validate(validateMovie), asyncHandler(async (req,res)=>{
  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send('Invalid genre.');

  //make object to put into mongoDB
  const movie = new Movie({
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate
  })

  await movie.save();
  res.send(movie);
}));


//update genre
router.put('/:id', auth, validate(validateMovie), asyncHandler(async (req,res)=>{
  //validate ID
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send('Invalid genre ID');

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send('Invalid genre.');

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    { 
      title: req.body.title,
      genre: {
        _id: genre._id,
        name: genre.name
      },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate
    },
    {
      new: true,
      runValidators: true
    }
  )

  if (!movie)
    return res.status(404).send('Movie not found')
 
  res.send(movie);
}));

//delete genre
router.delete('/:id', auth, asyncHandler(async (req,res)=>{
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send('Invalid ID');
  
  const movie = await Movie.findByIdAndDelete(req.params.id);
  
  if(!movie) return res.status(404).send('Movie not found');
  res.send(movie); 
}));

module.exports= router;