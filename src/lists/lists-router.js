const express = require('express');
const xss = require('xss');
const ListsService = require('./lists-service');

const listsRouter = express.Router();
const jsonParser = express.json();

listsRouter.use(function(req,res,next){ if(req.session.user) { next() } else { res.status(403).end() } });

const serializeList = (list) => ({
    id: list.id,
    name: xss(list.name),
    content: xss(list.content),
    date_published: list.date_published,
    author: list.author,
  });

listsRouter
.route('/')
.get((req, res) => {
  ListsService.getLists(
    req.app.get('db'),
    req.session.user.id,
    )
.then((lists) => {
  res.json(lists.map(serializeList));
});
})
.post(jsonParser, (req, res, next) => {
  const { name, author } = req.body;
  const newList = { name, author };
  newList.author = req.session.user.id;
  for (const [key, value] of Object.entries(newList)) {
    if (value == null) {
      return res.status(400).json({
        error: { message: `Missing '${key}' in request body` },
      });
    }
  }
  ListsService.insertList(
    req.app.get('db'),
    newList
  )
    .then((list) => {
      res
        .status(201)
        .json(serializeList(list));
    })
    .catch(next);
  });
  listsRouter
  .route('/:list_id')
  .delete((req, res, next) => {
    ListsService.deleteFromAllLists(
      req.app.get('db'),
      req.params.list_id
    )

      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });
  listsRouter
  .route('/shared')
  .get((req, res) => {
    ListsService.getSharedLists(req.app.get('db'), req.session.user.id)
  .then((lists) => {
    res.json(lists.map(serializeList));
  });
});
module.exports = listsRouter;
