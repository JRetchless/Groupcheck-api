// const path = require('path')
// const express = require('express')
// const xss = require('xss')
// const ItemsService = require('./items-service')

// const itemsRouter = express.Router()
// const jsonParser = express.json()

// // const serializeItem = item => ({
// //   id: item.id,
// //   name: item.name,
// //   content: xss(item.content),
// //   priority: item.priority,
// //   list_id: item.list_id,
// //   user_id: item.user_id
// // })
// // itemsRouter
// //   .route('/:listid')
// //   .get((req, res) => {
// //     // res.send('hello, Im working!' + req.params.listid)
// //     ItemsService.getAllItems(
// //       req.app.get('db'),
// //       req.params.listid
// //     )
// //     .then(items => {
// //       res.json(items.map(serializeItem))
// //     })
// //   })

// // itemsRouter
// //   .route('/:list_id')
// //   .get((req, res, next) => {
// //     const knexInstance = req.app.get('db')
// //     console.log('listid');
// //     console.log(req.params.list_id);
// //     ItemsService.getAllItems(
// //       knexInstance, 
// //       req.params.list_id
// //       )
// //       .then(items => {
// //         res.json(items.map(serializeItem))
// //       })
// //       .catch(next)
// //   })
// //   .post(jsonParser, (req, res, next) => {
// //     const { name, content, list_id, priority, user_id } = req.body
// //     const newItem = { name, content, priority, list_id, user_id  }

// //     for (const [key, value] of Object.entries(newItem))
// //       if (value == null)
// //         return res.status(400).json({
// //           error: { message: `Missing '${key}' in request body` }
// //         })

// //     ItemsService.insertItem(
// //       req.app.get('db'),
// //       newItem
// //     )
// //       .then(item => {
// //         res
// //           .status(201)
// //           .location(path.posix.join(req.originalUrl, `/${item.id}`))
// //           .json(serializeItem(item))
// //       })
// //       .catch(next)
// //   })

// // itemsRouter
// //   .route('/:item_id')
// //   .all((req, res, next) => {
// //     ItemsService.getById(
// //       req.app.get('db'),
// //       req.params.item_id
// //     )
// //       .then(item => {
// //         if (!item) {
// //           return res.status(404).json({
// //             error: { message: `Item doesn't exist` }
// //           })
// //         }
// //         res.item = item
// //         next()
// //       })
// //       .catch(next)
// //   })
// //   .get((req, res, next) => {
// //     res.json(serializeItem(res.item))
// //   })
// //   .delete((req, res, next) => {
// //     ItemsService.deleteItem(
// //       req.app.get('db'),
// //       req.params.item_id
// //     )
// //       .then(numRowsAffected => {
// //         res.status(204).end()
// //       })
// //       .catch(next)
// //   })
// //   .patch(jsonParser, (req, res, next) => {
// //     const { name, content, priority } = req.body
// //     const itemToUpdate = { name, content, priority }

// //     const numberOfValues = Object.values(itemToUpdate).filter(Boolean).length
// //     if (numberOfValues === 0)
// //       return res.status(400).json({
// //         error: {
// //           message: `Request body must contain 'content'`
// //         }
// //       })

// //     ItemsService.updateItem(
// //       req.app.get('db'),
// //       req.params.item_id,
// //       itemToUpdate
// //     )
// //       .then(numRowsAffected => {
// //         res.status(204).end()
// //       })
// //       .catch(next)
// //   })

// module.exports = itemsRouter