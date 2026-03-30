const express = require('express');
const mongoose = require('mongoose')

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/async');

const Joi = require('joi');
const router = express.Router();

const {Genre, validate: validateGenre} = require('../models/genre');


//show all genre list
router.get('/', asyncHandler(async (req,res)=>{
  const genres = await Genre.find().sort('name');
  res.send(genres);
}));

//output particular genre
router.get('/:id', validateObjectId, asyncHandler(async (req,res)=>{
  const genre = await Genre.findById(req.params.id)
  
  if(!genre) return res.status(404).send('Genre not found');
  res.send(genre);
}));

//add genre
router.post('/', auth, validate(validateGenre), asyncHandler(async (req,res)=>{
  //make object to put into mongoDB
  let genre = new Genre({
    name: req.body.name,
    likability: req.body.likability
  })

  genre = await genre.save();
  res.send(genre);
}));


//update genre
router.put('/:id', auth, validate(validateGenre), asyncHandler(async (req,res)=>{
  //validate ID
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send('Invalid genre ID');

  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    {
      name:req.body.name,
      likability: req.body.likability
    },
    {
      new: true,
      runValidators: true
    }
  )

  if (!genre)
    return res.status(404).send('Genre not found')
 
  res.send(genre);
}));

//delete genre
router.delete('/:id', [auth,admin], asyncHandler(async (req,res)=>{
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send('Invalid ID');
  
  const genre = await Genre.findByIdAndDelete(req.params.id);
  
  if(!genre) return res.status(404).send('Genre not found');
  res.send(genre); 
}))



module.exports= router;