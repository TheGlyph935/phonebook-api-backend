require('dotenv').config()
const express = require('express')
const req = require('express/lib/request')
const app = express()
app.use(express.json())
const morgan = require('morgan')
const cors = require('cors')
const { response } = require('express')
const Person = require('../models/person')


morgan.token('body', (request, response) => {
  return JSON.stringify(request.body)
})


app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body :status'))
app.use(express.static('build'))

let persons = []


app.get('/', (request, response) =>{
  response.send('<h1>Phonebook</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(person => {
    response.json(person)
  })
})

app.get('/info', (request, response) => {
  response.send(`<h2>Phonebook contains information for ${persons.length} <br/> ${new Date()}</h2>`)
})

app.get('/api/persons/:id', (request, response, next) =>{
  
  Person.findById(request.params.id)
  .then(person =>{
    if (person) {
      response.json(person)
    } else{
      response.status(404).end()
    }
  })
  .catch(error => {
    next(error)
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  
  const {name, number} = request.body
  const id = request.params.id
  
  const person = {
    name: body.name,
    number: body.number,
  }

  // FIND BY ID TO MAKE SURE CREDENTIALS ARENT THE SAME
  Person.findById(request.params.id)
  .then(returnedPerson => {
    if(returnedPerson.name === person.name && returnedPerson.number === person.number){
      response.status(400).send({error: 'Nothing was changed, could not replace anything.'})
    }
  })

  Person.findByIdAndUpdate(request.params.id, 
    {content, important}, 
    {new: true, runValidators: true, context:'query'},)
  .then(updatedPerson => {
    response.json(updatedPerson)
  })
  .catch(error => {
    console.error(error)
    next(error)
  })
})

app.delete('/api/persons/:id', (request, response, next) => {

  Person.findByIdAndDelete(request.params.id)
  .then(result => {
    if(result){
      response.status(204).end()
    } else{
      response.status(400).send({error: `Person with ID ${request.params.id} doesn't exist`})
    }
  })
  .catch(error => {
    next(error)
  })
})

app.post('/api/persons', (request, response, next) => {
  const person = request.body

  // This for loop makes sure name of person to be added is not repeated.
  for(let i = 0; i < persons.length; i++){
    if(persons[i].name === person.name){
      return response.status(400).json({
        error: "Name must be unique"
      }).end()
    }
  }


  const allIds = persons.map(person => person.id)
  const maxId = Math.max(...allIds)

  const newPerson = new Person({
    id: maxId + 1,
    name: person.name,
    number: person.number
  })

  persons = [...persons, newPerson]

  newPerson.save()
  .then(savedPerson => {
    response.json(savedPerson).status(204)
  })
  .catch(error => next(error))
})

// checks if error is CastError or ValidationError
app.use((error, request, response, next) => {
  console.error(error.message)

  if(error.name === 'CastError'){
    response.status(400).send({error: 'malformatted ID'})
  } else if(error.name === 'ValidationError'){
    return response.status(400).json({error: error.message})
  }

  next(error)
})

// checks for unknown endpoint
app.use((error, request, response, next) => {
  response.status(404).send({error: 'Unknown Endpoint'})
})


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`App running on PORT # ${PORT}`)
})
