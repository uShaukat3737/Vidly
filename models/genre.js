const Joi = require('joi');
const mongoose = require('mongoose')

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  likability: {
    type: Number,
    min: 0, 
    max: 5
    
  }
});

//validation logic
function validateGenre(genre){
  //make a schema with the 
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    likability: Joi.number().integer().min(0).max(5).required()

  })
  return schema.validate(genre);
};

exports.genreSchema = genreSchema;
exports.Genre = mongoose.model('Genre', genreSchema);
exports.validate = validateGenre;