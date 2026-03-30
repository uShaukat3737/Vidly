const mongoose = require('mongoose')
const Joi = require('joi');


const rentalSchema = new mongoose.Schema({
  customer: {
    type : new mongoose.Schema({
      name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
      },
      isGold: {
        type: Boolean,
        default: false
      },
      phone: {
        type: String,
        required: true,
        minlength:11,
        maxlength:11
      }
    }),
    required: true
  },
  
  movie: {
    type: new mongoose.Schema({
      title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        trim: true
      },
      dailyRentalRate: {
        type: Number,
        min: 1, 
        max: 255,
        required: true
      },
      
    }),
    required: true
  },
  
  dateOut: {
    type: Date,
    required: true,
    default: Date.now
  },
  dateReturned: {
    type: Date
  },  
  rentalFee: {
    type: Number,
    min: 0
  },
});

rentalSchema.statics.lookup = function(customerId, movieId) {
  return this.findOne({
    'customer._id': customerId,
    'movie._id': movieId
  });
};

rentalSchema.methods.return = function() {
  this.dateReturned = new Date();

  const rentalDays = Math.floor((this.dateReturned - this.dateOut) / (1000 * 60 * 60 * 24));
  this.rentalFee = rentalDays * this.movie.dailyRentalRate;
} 

const Rental = mongoose.model('Rental', rentalSchema);

//validation logic
function validateRental(rental){
  //make a schema with the 
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  })
  return schema.validate(rental);
};

function validateReturn(obj){
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  });
  return schema.validate(obj);  
}

exports.Rental = mongoose.model('Rental', rentalSchema);
exports.validate = validateRental;
exports.validateReturn = validateReturn;