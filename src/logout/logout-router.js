const path = require('path')
const express = require('express')
const xss = require('xss')

logoutRouter= express.Router();


logoutRouter
.route('/')
.get((req,res) => {
    req.session.user = null;
    res.end()
})

module.exports = logoutRouter