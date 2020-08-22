const express = require('express');
const xss = require('xss');
const md5 = require('md5');
const AuthService = require('./auth-service');
const authRouter = express.Router();
const jsonParser = express.json();

const serializeUser = (user) => ({
  id: user.id,
  firstname: xss(user.firstname),
  lastname: xss(user.lastname),
  email: xss(user.email),
  date_created: user.date_created,
  p_word: user.p_word,
});

authRouter
  .route('/')
  .post(jsonParser, function (req, res) {
    let { email, p_word } = req.body;
    p_word = md5(p_word);

    AuthService.getUser(
      req.app.get('db'), email, p_word,
    )
    .then((data) => {
      console.dir('authRouter .post data');
      console.dir(data);
      if (data) {
        const user = serializeUser(data);
        req.session.user= user;
        console.dir('session user has been set')
        console.dir(req.session.user)
        return res.json({ "status": "success", "id": user.id});
      } else {
        console.dir('authrouter has failed, req.session.user below')
        console.dir(req.session.user);
        return res.status(400).end();  
      }
    });
});

module.exports = authRouter;
