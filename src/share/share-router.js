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
    list_id: share.list_id,
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
        console.dir('USER')
        console.dir(user)
        console.dir('USER.serialize')
        console.dir(serializeUser(user))
        res.json(serializeUser(user))
    })
})


shareRouter
.route('/:user_id/:list_id')
.post(jsonParser, (req, res, next) => {
    console.log('req.params.user_id')
    console.log(req.params.user_id)
    console.log('req.params.list_id')
    console.log(req.params.list_id)
    const {list_id, shared_to } = req.body
    const shared_by = String(req.session.user.id)
    console.log('SHARED_BY')
    console.dir(shared_by)
    const shareData = { list_id, shared_by, shared_to }
    shareData.list_id = req.params.list_id
    shareData.shared_to = req.params.user_id
    console.dir(shareData)
    let serializedShare = serializeShare(shareData)
    console.log('SERIALIZEDSHARE')
    console.dir(serializedShare)
    if(serializedShare && serializedShare.list_id){
        for (const [key, value] of Object.entries(serializedShare)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }
        console.log('calling checkforshare')
        ShareService.checkForShare(
            req.app.get('db'),
            serializedShare
        )
        .then(data => {
            if(data) {
                console.log('data')
                console.log(data)
                return data
            }else{
                console.log('no data')
               return ShareService.shareList(
                    req.app.get('db'),
                    serializedShare
                )
                // .then(list => {
                //     console.dir(list)
                //     // res
                //     //     .status(201)
                //     //     .json(serializeList(list))
                // })
                .catch(next)  
            }
        })
        .then(data => {
            if(data){
                console.log('final response')
                console.log(data)
                res
                    .status(201)
                    .json(data)
            }
        })
    }
})

module.exports = shareRouter