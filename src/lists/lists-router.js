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
  console.dir('listRouter .get req.session.user')
  console.dir(req.session.user)
  ListsService.getLists(
    req.app.get('db'),
    req.session.user.id,
    )
.then((lists) => {
  return res.json(lists.map(serializeList));
})
.catch((err) => {
  console.log(err)
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
      return res
        .status(201)
        .json(serializeList(list));
    })
    .catch(next);
  });
  listsRouter
  .route('/:list_id')
  .delete(jsonParser,(req, res, next) => {
    const { author } = req.body;
    if (req.session.user.id === { author }) {
      ListsService.deleteFromAllLists(
        req.app.get('db'),
        req.params.list_id
      )
    }
    ListsService.deleteFromSharedLists(
      req.app.get('db'),
      req.params.list_id,
      req.session.user.id
    )
  .then(() => {
       return res.status(204).end();
      })
      .catch(next)
  });
  listsRouter
  .route('/shared')
  .get((req, res) => {
    ListsService.getSharedLists(req.app.get('db'), req.session.user.id)
  .then((lists) => {
    return res.json(lists.map(serializeList));
  });
});
module.exports = listsRouter;
