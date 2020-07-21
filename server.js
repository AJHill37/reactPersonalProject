const express = require('express')

// use process.env variables to keep private variables,
require('dotenv').config()

// Express Middleware
const helmet = require('helmet') // creates headers that protect from attacks (security)
const bodyParser = require('body-parser') // turns response into usable format
const cors = require('cors')  // allows/disallows cross-site communication
const morgan = require('morgan') // logs requests

// db Connection w/ Heroku
// const db = require('knex')({
//   client: 'pg',
//   connection: {
//     connectionString: process.env.DATABASE_URL,
//     ssl: true,
//   }
// });

// db Connection w/ localhost
var db = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : '',
    password : '',
    database : 'toptal-timetracker'
  }
});

// Controllers - aka, the db queries
const main = require('./controllers/main')

// App
const app = express()

// App Middleware
const whitelist = ['http://localhost:3001']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(helmet())
app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(morgan('combined')) // use 'tiny' or 'combined'

// App Routes - Auth
app.get('/', (req, res) => res.send('hello worlder'))

app.post('/signup', (req, res) => main.signup(req, res, db))
app.post('/signin', (req, res) => main.signin(req, res, db))
app.get('/getTimeEntries/:username/:token', (req, res) => main.getTimeEntries(req, res, db))
app.delete('/deleteTimeEntry/:username/:token', (req, res) => main.deleteTimeEntry(req, res, db))
app.post('/postTimeEntry/:username/:token', (req, res) => main.postTimeEntry(req, res, db))
app.put('/putTimeEntry/:username/:token', (req, res) => main.putTimeEntry(req, res, db))

app.get('/getAllUsers/:username/:token', (req, res) => main.getAllUsers(req, res, db))
app.delete('/deleteUser/:username/:token', (req, res) => main.deleteUser(req, res, db))
app.put('/putUser/:username/:token', (req, res) => main.putUser(req, res, db))

// App Server Connection
app.listen(process.env.PORT || 3000, () => {
  console.log(`app is running on port ${process.env.PORT || 3000}`)
})