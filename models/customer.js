const Joi = require('joi');
const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
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
});

//validation logic
function validateCustomer(customer){
  //make a schema with the 
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    phone: Joi.string().min(11).max(11).required(),
    isGold: Joi.boolean().required()
  })
  

  return schema.validate(customer);
};

exports.Customer = mongoose.model('Customer', customerSchema);
exports.validate = validateCustomer;