const express = require('express')
const xss = require('xss')

const shareRouter = express.Router()
const jsonParser = express.json()

const serializeUser = user => ({
    id : user.id
})

shareRouter
.route('/')
.get((req, res) => {
    ShareService.getUserFromEmail(req.app.get('db'),
    req.params.userEmail
    )
    .then(user => {
        res.json(user.map(serializeUser))
    })
})

shareRouter
.route('/:userId/:listId')
.post(jsonParser, (req, res, next) => {
    const { userId, listId } = req.body
    const shareData = { listId, sharerId, userId }
    shareData.userId = req.params.userId
    shareData.listId = req.params.listId
    shareData.sharerId = req.session.user
    for (const [key, value] of Object.entries(shareData)) {
        if (value == null) {
            return res.status(400).json({
                error: { message: `Missing '${key}' in request body`}
            })
        }
    }
    ShareService.shareList(
        req.app.get('db'),
        shareData
    )
    .then(list => {
        res
            .status(201)
            .json(serializeList(list))
    })
    .catch(next)
})

module.exports = shareRouter