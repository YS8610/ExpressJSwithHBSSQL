var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 20,
  host: "localhost",
  user: process.env.DB_USERNAME,
  password: process.env.DB_PW,
  database: process.env.DB_NAME
});

module.exports = pool;