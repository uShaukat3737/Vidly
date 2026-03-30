const express = require('express');
const mongoose = require('mongoose')
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');
const asyncHandler = require('../middleware/async');
const router = express.Router();
router.use(auth);
const {Customer, validate: validateCustomer} = require('../models/customer');


//show all customer list
router.get('/', asyncHandler(async (req,res)=>{
  const customer = await Customer.find().sort('name');
  res.send(customer);
}));

//output particular genre
router.get('/:id', asyncHandler(async (req,res)=>{
  const genre = await Customer.findById(req.params.id)
  if(!genre) return res.status(404).send('Customer not found');
  res.send(genre);
}));

//add Customer
router.post('/', validate(validateCustomer), asyncHandler(async (req,res)=>{
  //make object to put into mongoDB
  let customer = new Customer({
    name: req.body.name,
    isGold: req.body.isGold,
    phone: req.body.phone
  })

  await customer.save();
  res.send(customer);
}));


//update customer
router.put('/:id', validate(validateCustomer), asyncHandler(async (req,res)=>{
  //validate ID
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send('Invalid Customer ID');

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      name:req.body.name,
      isGold: req.body.isGold,
      phone: req.body.phone
    },
    {
      new: true,
      runValidators: true
    }
  )

  if (!customer)
    return res.status(404).send('Customer not found')
 
  res.send(customer);
}));

//delete customer
router.delete('/:id', asyncHandler(async (req,res)=>{
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send('Invalid ID');
  
  const customer = await Customer.findByIdAndDelete(req.params.id);
  
  if(!customer) return res.status(404).send('Customer not found');
  res.send(customer);
}))



module.exports= router;