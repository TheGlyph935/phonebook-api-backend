const mongoose = require('mongoose')
const pass = require('./mongoPassword')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]


const url = 
`mongodb+srv://Pablo:${pass.pass}@phonebook-backend-clust.pqwyv.mongodb.net/PhonebookDatabase?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  phone: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3){
  console.log('phonebook')
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
}

const person = new Person({
  name: process.argv[3],
  phone: process.argv[4]
})


person.save().then(result => {
  mongoose.connection.close()
})


