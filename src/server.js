// const express = require('express');
// const app = express();

// const PORT = process.env.PORT || 3000;

// app.get('/api/*', (req, res) => {
//   res.json({ok: true});
// });

// app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// module.exports = {app};
const knex = require('knex')
const app = require('./app')
const { PORT, DATABASE_URL } = require('./config')

const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
})

app.set('db', db)

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})