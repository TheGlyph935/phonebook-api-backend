/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const { request } = require('express')
const mongoose = require('mongoose')


const url = process.env.MONGODB_URI



console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  number: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function(number) {

        console.log(number)
        if(number.includes('-')){
          const newNumber = number.split('-')[0]
          return newNumber === 2 || newNumber === 3
        } else{
          console.log('penis')
          return true
        }
      },
      message: 'Improper phone number format'
    },
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Person', personSchema)