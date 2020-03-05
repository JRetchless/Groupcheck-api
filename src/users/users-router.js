const path = require('path')
const express = require('express')
const xss = require('xss')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const jsonParser = express.json()

const serializeUser = user => ({
  id: user.id,
  firstname: xss(user.firstname),
  lastname: xss(user.lastname),
  email: xss(user.email),
  date_created: user.date_created,
})

const serializeList = list => ({
  id: list.id,
  name: xss(list.name),
  content: xss(list.content),
  date_published: list.date_published,
  author: list.author,
})

const serializeItem = item => ({
  id: item.id,
  name: item.name,
  content: xss(item.content),
  priority: item.priority,
  list_id: item.list_id,
  user_id: item.user_id
})

usersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    UsersService.getAllUsers(knexInstance)
      .then(users => {
        res.json(users.map(serializeUser))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { firstname, lastname, username, password } = req.body
    const newUser = { firstname, lastname, username }

    for (const [key, value] of Object.entries(newUser)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

    newUser.password = password;

    UsersService.insertUser(
      req.app.get('db'),
      newUser
    )
      .then(user => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${user.id}`))
          .json(serializeUser(user))
      })
      .catch(next)
  })

usersRouter
  .route('/:user_id')
  .get((req, res, next) => {
    UsersService.getById(
      req.app.get('db'),
      req.params.user_id
    )
      .then(user => {
        if (!user) {
          return res.status(404).json({
            error: { message: `User doesn't exist` }
          })
        }
        res.user = user
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeUser(res.user))
  })
  .delete((req, res, next) => {
    UsersService.deleteUser(
      req.app.get('db'),
      req.params.user_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { firstname, lastname, username, password } = req.body
    const userToUpdate = { firstname, lastname, username, password }

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'firstname', 'lastname', 'username', or 'password'`
        }
      })

    UsersService.updateUser(
      req.app.get('db'),
      req.params.user_id,
      userToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

  usersRouter
    .route('/:user_id/lists')
    .get((req, res) => {
      UsersService.getAllLists(
        req.app.get('db'),
        req.params.user_id
      )
    .then(lists => {
      res.json(lists.map(serializeList))
    })
  })

  usersRouter
  .route('/:user_id/lists/:list_id')
  .get((req, res) => {
    UsersService.getListItems(
      req.app.get('db'),
      req.params.user_id,
      req.params.list_id
    )
  .then(items => {
    res.json(items.map(serializeItem))
  })

  usersRouter
  .route('/auth')
  .post((req, res) => {
    // const { firstname, lastname, username, password } = req.body
    res.send('hello youve reached the endpoint')
    // UsersService.getListItems(
    //   req.app.get('db'),
    //   req.params.user_id,
    //   req.params.list_id
    // )
  // .then(items => {
  //   // res.json(items.map(serializeItem))
  })
})

module.exports = usersRouter