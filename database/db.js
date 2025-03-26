const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  port: 5432,
  database: "facebookdb",
  password: process.env.DB_PASS,
});

module.exports = pool;
