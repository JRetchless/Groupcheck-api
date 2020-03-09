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
    const { firstname, lastname, email } = req.body
    const newUser = { firstname, lastname, email }

    for (const [key, value] of Object.entries(newUser)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

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
    const { firstname, lastname, email } = req.body
    const userToUpdate = { firstname, lastname, email }

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'firstname', 'lastname', or 'email'`
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
//everything above this works :D
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
    .post(jsonParser, (req, res, next) => {
      const { name, author } = req.body
    // How do I identify that author is the user_id?
      const newList = { name, author }
     newList.author = req.params.user_id

      for (const [key, value] of Object.entries(newList)) {
        if (value == null) {
          return res.status(400).json({
            error: { message: `Missing '${key}' in request body` }
          })
        }
      }
      UsersService.insertList(
        req.app.get('db'),
        req.params.
        newList
      )
        .then(list => {
          res
            .status(201)
            //need to figure out how to add id...? I thought it was generated automatically...do I need to fetch it or something...?
            .location(path.posix.join(req.originalUrl, `/:user_id/lists/${list.id}`))
            .json(serializeList(list))
        })
        .catch(next)
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
})
.post(jsonParser, (req, res, next) => {
  // const { name, content, priority, list_id, user_id } = req.body
  // const newItem = { name, content, priority, list_id, user_id }

  // newItem.list_id = req.params.list_id;
  // newItem.user_id = req.params.user_id;
  // for (const [key, value] of Object.entries(newItem)) {
  //   if (value == null) {
  //     return res.status(400).json({
  //       error: { message: `Missing '${key}' in request body` }
  //     })
  //   }
  // }
  res.send('I am working')
  // UsersService.insertItem(
  //   req.app.get('db'),
  //   newItem
  // )
  //   .then(item => {
  //     res
  //       .status(201)
  //       .json(serializeItem(item))
  //   })
  //   .catch(next)
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

module.exports = usersRouter