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

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

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

app.get('/api/persons/:id', (request, response) =>{
  Person.findById(request.params.id).then(person =>{
    response.json(person)
  })
})

app.delete('/api/persons/:id', (request, response) => {

  Person.findByIdAndDelete(request.params.id).then(person => {
    response.status(204).end()
  })
})

app.post('/api/persons', (request, response) => {
  const person = request.body

  // checks if there is content in the first place
  
  if(person.name === undefined || person.number === undefined){
    response.status(400).json({error: "content is missing"})
  }
  // checks if person object exsists, has name & number in it before proceeding
  if(!person || !person.name || !person.number){
    response.status(400).json({
      error: "Person object is either missing or doesn't have name or number of the person to be added."
    })
  }
  // This for loop makes sure name of person to be added is not repeated.
  for(let i = 0; i < persons.length; i++){
    if(persons[i].name === person.name){
      response.status(400).json({
        error: "Name must be unique"
      })
    }
  }


  const allIds = persons.map(person => person.id)
  const maxId = Math.max(...allIds)

  const newPerson = new Person({
    id: maxId + 1,
    name: person.name,
    number: person.number,
  })

  persons = [...persons, newPerson]

  newPerson.save().then(savedPerson => {
    response.json(savedPerson).status(204)
  })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`App running on PORT # ${PORT}`)
})
