const express = require('express');
const xss = require('xss');
const ShareService = require('./share-service');

const shareRouter = express.Router();
const jsonParser = express.json();

const serializeUser = (user) => ({
    id: user.id,
    email: xss(user.email),
});

const serializeShare = (share) => ({
    list_id: share.list_id,
    shared_by: xss(share.shared_by),
    shared_to: xss(share.shared_to),
});

shareRouter
.route('/:email')
.get((req, res) => {
    ShareService.getUserFromEmail(req.app.get('db'),
    req.params.email,)
    .then((user) => {
        if (!user) {
            return res.status(404);
        }
        console.dir('USER');
        console.dir(user);
        console.dir('USER.serialize');
        console.dir(serializeUser(user));
        res.json(serializeUser(user));
    });
});

shareRouter
.route('/:user_id/:list_id')
.post(jsonParser, (req, res, next) => {
    const { list_id, shared_to } = req.body;
    const shared_by = String(req.session.user.id);
    const shareData = { list_id, shared_by, shared_to };
    shareData.list_id = req.params.list_id;
    shareData.shared_to = req.params.user_id;
    let serializedShare = serializeShare(shareData);
    if (serializedShare && serializedShare.list_id) {
        for (const [key, value] of Object.entries(serializedShare)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` },
                });
            }
        }
        ShareService.checkForShare(
            req.app.get('db'),
            serializedShare
        )
        .then((data) => {
            if (data) {
                return data;
            }
            console.log('no data');
            return ShareService.shareList(
                req.app.get('db'),
                serializedShare
            )
            .catch(next);
        })
        .then((data) => {
            if (data) {
                res
                    .status(201)
                    .json(data);
            }
        });
    }
});

module.exports = shareRouter;
