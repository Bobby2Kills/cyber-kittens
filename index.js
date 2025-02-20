const express = require('express');
const jwt = require("jsonwebtoken")
const app = express();
require("dotenv").config();
const { User } = require('./db');

const SIGNING_SECRET = process.env.SIGNING_SECRET
console.log("secret:", process.env.SIGNING_SECRET)

const setUser = (req, res, next) => {
  const auth = req.header('Authorization')
  try {
    if(!auth) {
      next()
      return
    }
    const [, token] = auth.split(" ")
    const user = jwt.verify(token, SIGNING_SECRET)
  } catch (error) {
    console.log(error)
    next(error)
  }
}

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(setUser)

app.get('/', async (req, res, next) => {
  try {
    res.send(`
      <h1>Welcome to Cyber Kittens!</h1>
      <p>Cats are available at <a href="/kittens/1">/kittens/:id</a></p>
      <p>Create a new cat at <b><code>POST /kittens</code></b> and delete one at <b><code>DELETE /kittens/:id</code></b></p>
      <p>Log in via POST /login or register via POST /register</p>
    `);
  } catch (error) {
    console.error(error);
    next(error)
  }
});

app.post('/register', async (req,res, next) => {
  try {
    const {username, password} = req.body;
    console.log(username, password);
    const {id} = await User.create({ username, password })
    const token = jwt.sign({id, username}, SIGNING_SECRET)
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

// Verifies token with jwt.verify and sets req.user
// TODO - Create authentication middleware

// POST /register
// OPTIONAL - takes req.body of {username, password} and creates a new user with the hashed password

// POST /login
// OPTIONAL - takes req.body of {username, password}, finds user by username, and compares the password with the hashed version from the DB

// GET /kittens/:id
// TODO - takes an id and returns the cat with that id

// POST /kittens
// TODO - takes req.body of {name, age, color} and creates a new cat with the given name, age, and color

// DELETE /kittens/:id
// TODO - takes an id and deletes the cat with that id

// error handling middleware, so failed tests receive them
app.use((error, req, res, next) => {
  console.error('SERVER ERROR: ', error);
  if(res.statusCode < 400) res.status(500);
  res.send({error: error.message, name: error.name, message: error.message});
});

// we export the app, not listening in here, so that we can run tests
module.exports = app;
