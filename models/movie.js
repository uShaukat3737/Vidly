const mongoose = require('mongoose')
const {genreSchema} = require('./genre');
const Joi = require('joi');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    trim: true
  },
  numberInStock: {
    type: Number,
    min: 0,
    maxx: 255,
    required: true
  },
  dailyRentalRate: {
    type: Number,
    min: 1, 
    max: 255,
    required: true
  },
  genre: {
      type :genreSchema, 
      required: true
    }
});

//validation logic
function validateMovie(movie){
  //make a schema with the 
  const schema = Joi.object({
    title: Joi.string().min(5).max(50).required(),
    numberInStock: Joi.number().integer().min(0).required(),
    dailyRentalRate: Joi.number().integer().min(1).required(),
    genreId: Joi.objectId().required()
  })
  return schema.validate(movie);
};

exports.Movie = mongoose.model('Movie', movieSchema);
exports.validate = validateMovie;