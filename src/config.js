// module.exports = {
//   PORT: process.env.PORT || 8080,
//   API_BASE_URL: process.env.REACT_APP_API_BASE_URL ||
//     "http://localhost:3000/api"
// };
module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres@localhost/groupcheck',
  CLIENT_ORIGIN: "http://localhost:3000"
}
