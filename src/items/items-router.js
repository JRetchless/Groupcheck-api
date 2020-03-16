const path = require('path')
const express = require('express')
const xss = require('xss')
const ItemsService = require('./items-service')

const itemsRouter = express.Router()
const jsonParser = express.json()
// // AUTH CODE BELOW
// itemsRouter.use(function(req,res,next){ if(req.session.user) { next() } else { res.status(403).end() } })
// if there is that user field  in the session, then they can continue otherwise they cant continue

const serializeItem = item => ({
  id: item.id,
  name: item.name,
  content: xss(item.content),
  priority: item.priority,
  list_id: item.list_id,
  user_id: item.user_id
})
itemsRouter
.route('/:list_id')
.get((req, res) => {
  ItemsService.getListItems(
    req.app.get('db'),
    req.params.list_id
  )
    .then(items => {
        res.json(items.map(serializeItem))
    })
})
// .post(jsonParser, (req, res, next) => {
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
// }) 
// //   .delete((req, res, next) => {
// //     ItemsService.deleteItem(
// //       req.app.get('db'),
// //       req.params.list_id
// //     )
// //       .then(numRowsAffected => {
// //         res.status(204).end()
// //       })
// //       .catch(next)
// //   })
//   .patch(jsonParser, (req, res, next) => {
//     const { name, content, priority } = req.body
//     const itemToUpdate = { name, content, priority }

//     // const numberOfValues = Object.values(itemToUpdate).filter(Boolean).length
//     // if (numberOfValues === 0)
//     //   return res.status(400).json({
//     //     error: {
//     //       message: `Request body must contain 'content'`
//     //     }
//     //   })

//     ItemsService.updateItem(
//       req.app.get('db'),
//       req.params.list_id,
//       itemToUpdate
//     )
//       .then(numRowsAffected => {
//         res.status(204).end()
//       })
//       .catch(next)
//   })

module.exports = itemsRouter