require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
var MemoryStore = require('memorystore')(session);
const { NODE_ENV } = require('./config');
const listsRouter = require('./lists/lists-router');
const usersRouter = require('./users/users-router');
const authRouter = require('./auth/auth-router');
const itemsRouter = require('./items/items-router');
const shareRouter = require('./share/share-router');
const logoutRouter = require('./logout/logout-router');

const app = express();

app.set('trust proxy', 1);
// trust first proxy
/*
example...
app.use(session({
    store: new RedisStore({
        pass: 'asdf',
    }),
    secret: 'asdf',
    proxy: true,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))
*/
// Middleware to set up session for auth
app.use(session({ secret: 'keyboard cat', proxy: true, resave: false, saveUnitialized: true, cookie: { sameSite: 'None', secure: true} 

    // secret: 'keyboard cat', 
    // resave: false, 
    // saveUninitialized: true, 
    // cookie: { 
    //     sameSite: 'None' , 
    //     secure: process.env.NODE_ENV !== 'development' 
    // },

    // secret: 'keyboard cat', 
    // name: 'some session name',
    // resave: false,
    // saveUninitialized: true,
    // cookie: {
    //     domain: "https://groupcheck.jonretchless.vercel.app/",
    //     maxAge: 3600,
    //     sameSite: "none",
    //     secure: true,
    // }
        //     domain: "https://groupcheck.jonretchless.vercel.app/",

    //        httpOnly: true,

//process.env.NODE_ENV !== 'development'
}));

app.use(
    cors({
        origin:
            "https://groupcheck.jonretchless.vercel.app",
        credentials: true,
    }),
);

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption));
app.use(helmet());

app.use('/api/users', usersRouter);
app.use('/api/lists', listsRouter);
app.use('/api/items', itemsRouter);
app.use('/api/login', authRouter);
app.use('/api/logout', logoutRouter);
app.use('/api/share', shareRouter);

app.use(express.static('build'))
app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error);
        response = { message: error.message, error };
    }
    res.status(500).json(response);
});

module.exports = app;
