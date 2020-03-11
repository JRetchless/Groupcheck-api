require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const {CLIENT_ORIGIN} = require('./config');
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
// const {API_BASE_URL} = require('./config');
// const listsRouter = require('./lists/lists-router');
const usersRouter = require('./users/users-router');
const authRouter = require('./users/auth-router');
// const itemsRouter = require('./items/items-router');
const session = require('express-session');

const app = express()

app.set('trust proxy', 1)
// trust first proxy
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: { secure: true } }))
//write piece of middleware that verifies that they were logged in before I give them access to routes
//now each request will have a session field so I can use that field to store some data about each session
//


const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
//usersRouter uses /api/users. If I have listsRouter and itemsRouter as /lists and /:list_id, will they be called if my path is /api/users/lists and /api/users/lists/:list_id?
//could I be using the routes /api/users, /api/:user_id, /api/:user_id/lists, and /api/:user_id/:list_id?
app.use('/api/users', usersRouter)
// app.use('/api/lists', listsRouter)
// app.use('/api/items', itemsRouter)
// app.use('/api/:user_id', usersRouter)
app.use('/api/users/:user_id', usersRouter)
// app.use('/api/:user_id/:list_id', itemsRouter )
app.use('/api/login', authRouter)
app.use('/api/signup', usersRouter)


app.get('/', (req, res) => {
    res.send('Hello, world!')
})
// app.use('/api', (req, res) => {
//     res.send('Nice try asshole, login first')
// })

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
      console.error(error)
      response = { message: error.message, error }
    }
    res.status(500).json(response)
})

app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);


// export const fetchUserProfile = (dispatch, userId) => {
//     fetch(`${API_BASE_URL}/users/${userId}`).then(res => {
//         if (!res.ok) {
//             return Promise.reject(res.statusText);
//         }
//         return res.json();
//     }).then(userProfile => {
//         dispatch(fetchUserProfileSuccess(userProfile));
//     }).catch(err => dispatch(fetchUserProfileError(err)));
// };

module.exports = app
