const express = require('express')
const xss = require('xss')
const ShareService = require('./share-service')

const shareRouter = express.Router()
const jsonParser = express.json()

const serializeUser = user => ({
    id : user.id,
    email: xss(user.email)
})

const serializeShare = share => ({
    id: share.id,
    shared_by: xss(share.shared_by),
    shared_to: xss(share.shared_to)
})

shareRouter
.route('/:email')
.get((req, res) => {
    ShareService.getUserFromEmail(req.app.get('db'),
    req.params.email
    )
    .then(user => {
        res.json(user.map(serializeUser))
    })
})


shareRouter
.route('/:user_id/:list_id')
.post(jsonParser, (req, res, next) => {
1    console.log('req.params.user_id')
    console.log(req.params.user_id)
    console.log('req.params.list_id')
    console.log(req.params.list_id)
    res.send('got your post request!')
    const shareData = { list_id, shared_by, shared_to }
    shareData.shared_to = req.params.user_id
    shareData.list_id = req.params.list_id
    shareData.shared_by = req.session.user
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