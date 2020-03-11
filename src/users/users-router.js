const path = require('path')
const express = require('express')
const xss = require('xss')
const UsersService = require('./users-service')
const md5 = require('md5')

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
  .route('/signup')
  .post(jsonParser, (req, res, next) => {
    const { firstname, lastname, email, p_word } = req.body
    const hashp_word = md5(p_word)
    const newUser = { firstname, lastname, email, hashp_word }

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
  .post('/login',function(req,res){ 
    knex('groupcheck_users').where('email',req.body['email']).where('p_word',md5(req.body['p_word'])).first() 
    .then(function(user){ if(user){ req.session.user=user; res.status(200).end(); }
     else{ res.status(404).end();
     }
     })
})

  //make another post for login, piece of middleware for routes other than login (you want to authenticate everything else)
  //this is why the routes should be split up. For all of the routes other than the users route you want the auth middleware

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
// everything above this works :D
  // usersRouter
  //   .route('/:user_id/lists')
  //   .get((req, res) => {
  //     UsersService.getAllLists(
  //       req.app.get('db'),
  //       req.params.user_id
  //     )
  //   .then(lists => {
  //     res.json(lists.map(serializeList))
  //   }) 
  // })
  //   .post(jsonParser, (req, res, next) => {
  //     const { name, author } = req.body
  //     const newList = { name, author }
  //    newList.author = req.params.user_id

  //     for (const [key, value] of Object.entries(newList)) {
  //       if (value == null) {
  //         return res.status(400).json({
  //           error: { message: `Missing '${key}' in request body` }
  //         })
  //       }
  //     }
  //     UsersService.insertList(
  //       req.app.get('db'),
  //       newList
  //     )
  //       .then(list => {
  //         res
  //           .status(201)
  //           .json(serializeList(list))
  //       })
  //       .catch(next)
  //     })
  //     .delete((req, res, next) => {
  //       UsersService.deleteList(
  //         req.app.get('db'),
  //         req.params.list_id
  //       )
  //         .then(numRowsAffected => {
  //           res.status(204).end()
  //         })
  //         .catch(next)
  //     })
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
  const { name, content, priority, list_id, user_id } = req.body
  const newItem = { name, content, priority, list_id, user_id }

  newItem.list_id = req.params.list_id;
  newItem.user_id = req.params.user_id;
  for (const [key, value] of Object.entries(newItem)) {
    if (value == null) {
      return res.status(400).json({
        error: { message: `Missing '${key}' in request body` }
      })
    }
  }
  UsersService.insertItem(
    req.app.get('db'),
    newItem
  )
    .then(item => {
      res
        .status(201)
        .json(serializeItem(item))
    })
    .catch(next)
}) 




  // usersRouter
  // .route('/auth')
  // .post((req, res) => {
  //   const { firstname, lastname, username, password } = req.body
  //   res.send('hello youve reached the endpoint')
  //   UsersService.getListItems(
  //     req.app.get('db'),
  //     req.params.user_id,
  //     req.params.list_id
  //   )
  // .then(items => {
  //   // res.json(items.map(serializeItem))
  // })

module.exports = usersRouter