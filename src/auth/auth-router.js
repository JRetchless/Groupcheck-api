const path = require('path')
const express = require('express')
const xss = require('xss')
const AuthService = require('./auth-service')
const knex = require('knex');

const md5 = require('md5')

const authRouter = express.Router()
const jsonParser = express.json()

// // const serializeList = list => ({
// //   id: list.id,
// //   name: xss(list.name),
// //   content: xss(list.content),
// //   date_published: list.date_published,
// //   author: list.author,
// // })



authRouter
  .route('/')
  .post(jsonParser,function(req,res){

    let { email, p_word } = req.body
    p_word= md5(p_word)

    AuthService.getUser(
      req.app.get('db'), req.body.email, p_word
    )
    .then(data => {
      res.json({"user_id": data.id})

      if(data && data['id']){
        res.json({"status": 'success'})
      }
      res.status(400).end()
    })


    // res.json({"email": req.body.email, "p_word": req.body.p_word})

    // res.json({"email": email, "p_word": p_word})
    // res.json(req.session)
    
    // .then(function(user){ if(user){ req.session.user=user; res.status(200).end(); }
    //  else{ res.status(404).end();
    //  }
    //  })
})



// listsRouter
//   .route('/')
//   .get((req, res, next) => {
//     const knexInstance = req.app.get('db')
//     ListsService.getAllLists(knexInstance)
//       .then(lists => {
//         res
//         .status(200)
//         .json(lists.map(serializeList))
//       })
//       .catch(next)
//   })
//   .post(jsonParser, (req, res, next) => {
//     const { name, content, author } = req.body
//     const newList = { name, content }

//     for (const [key, value] of Object.entries(newList))
//       if (value == null)
//         return res.status(400).json({
//           error: { message: `Missing '${key}' in request body` }
//         })
//     newList.author = author
//     ListsService.insertList(
//       req.app.get('db'),
//       newList
//     )
//       .then(list => {
//         res
//           .status(201)
//           .location(path.posix.join(req.originalUrl, `/${list.id}`))
//           .json(serializeList(list))
//       })
//       .catch(next)
//   })

// listsRouter
//   .route('/:list_id')
//   .all((req, res, next) => {
//     ListsService.getById(
//       req.app.get('db'),
//       req.params.list_id
//     )
//       .then(list => {
//         if (!list) {
//           return res.status(404).json({
//             error: { message: `List doesn't exist` }
//           })
//         }
//         res.list = list
//         next()
//       })
//       .catch(next)
//   })
//   .get((req, res, next) => {
//     res.json(serializeList(res.list))
//   })
//   .delete((req, res, next) => {
//     ListsService.deleteList(
//       req.app.get('db'),
//       req.params.list_id
//     )
//       .then(numRowsAffected => {
//         res.status(204).end()
//       })
//       .catch(next)
//   })
//   .patch(jsonParser, (req, res, next) => {
//     const { name, content } = req.body
//     const listToUpdate = { name, content }

//     const numberOfValues = Object.values(listToUpdate).filter(Boolean).length
//     if (numberOfValues === 0)
//       return res.status(400).json({
//         error: {
//           message: `Request body must content either 'name', or 'content'`
//         }
//       })

//     ListsService.updateList(
//       req.app.get('db'),
//       req.params.list_id,
//       listToUpdate
//     )
//       .then(numRowsAffected => {
//         res.status(204).end()
//       })
//       .catch(next)
//   })

module.exports = authRouter
