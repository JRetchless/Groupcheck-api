const express = require('express');

logoutRouter = express.Router();

logoutRouter
.route('/')
.get((req, res) => {
    req.session.user = null;
    res.end();
});

module.exports = logoutRouter;
