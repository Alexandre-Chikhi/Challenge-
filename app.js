require('dotenv').config()

const express = require('express')

const app = express()

app.use(express.json())

const port = process.env.APP_PORT ?? 5000

const welcome = (req, res) => {
  res.send('Welcome to my favourite movie list')

  // in app.js

  const isItDwight = (req, res) => {
    if (
      req.body.email === 'dwight@theoffice.com' &&
      req.body.password === '123456'
    ) {
      res.send('Credentials are valid')
    } else {
      res.sendStatus(401)
    }
  }

  app.post('/api/login', isItDwight)
}

app.get('/', welcome)

const movieHandlers = require('./movieHandlers')
const userHandlers = require('./userHandlers')
const { hashPassword, verifyPassword, verifyToken } = require('./auth.js')

app.get('/api/movies', movieHandlers.getMovies)
app.get('/api/movies/:id', movieHandlers.getMovieById)
app.get('/api/users', userHandlers.getUsers)
app.get('/api/users/:id', userHandlers.getUsersById)
app.post('/api/users', hashPassword, userHandlers.postUser)
app.post(
  '/api/login',
  userHandlers.getUserByEmailWithPasswordAndPassToNext,
  verifyPassword
)

app.use(verifyToken)

app.post('/api/movies', movieHandlers.postMovie)
app.put('/api/movies/:id', movieHandlers.updateMovie)
app.delete('/api/movies/:id', movieHandlers.deleteMovie)
app.post('/api/movies', verifyToken, movieHandlers.postMovie)
app.put('/api/users/:id', userHandlers.updateUser)
app.delete('/api/users/:id', userHandlers.deleteUser)

app.post(
  '/api/login',
  userHandlers.getUserByEmailWithPasswordAndPassToNext,
  verifyPassword
)

app.listen(port, err => {
  if (err) {
    console.error('Something bad happened')
  } else {
    console.log(`Server is listening on ${port}`)
  }
})
