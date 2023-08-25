// use pg to make database connection
const {Pool} = require('pg');
const querystring = require("querystring");
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

module.exports = pool;