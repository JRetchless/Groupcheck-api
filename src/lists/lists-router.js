// const path = require('path')
// const express = require('express')
// const xss = require('xss')
// const ListsService = require('./lists-service')

// const listsRouter = express.Router()
// const jsonParser = express.json()

// listsRouter.use(function(req,res,next){ if(req.session.user) { next() } else { res.status(403).end() } })


// const serializeList = list => ({
//     id: list.id,
//     name: xss(list.name),
//     content: xss(list.content),
//     date_published: list.date_published,
//     author: list.author,
//   })
  
  
  
// listsRouter
// .route('/lists')
// .get((req, res) => {
//   UsersService.getAllLists(
//     req.app.get('db'),
//     req.params.user_id
//   )
// .then(lists => {
//   res.json(lists.map(serializeList))
// }) 
// })
// .post(jsonParser, (req, res, next) => {
//   const { name, author } = req.body
//   const newList = { name, author }
//  newList.author = req.params.user_id

//   for (const [key, value] of Object.entries(newList)) {
//     if (value == null) {
//       return res.status(400).json({
//         error: { message: `Missing '${key}' in request body` }
//       })
//     }
//   }
//   UsersService.insertList(
//     req.app.get('db'),
//     newList
//   )
//     .then(list => {
//       res
//         .status(201)
//         .json(serializeList(list))
//     })
//     .catch(next)
//   })
//   .delete((req, res, next) => {
//     UsersService.deleteList(
//       req.app.get('db'),
//       req.params.list_id
//     )
//       .then(numRowsAffected => {
//         res.status(204).end()
//       })
//       .catch(next)
//   })

// module.exports = listsRouter

