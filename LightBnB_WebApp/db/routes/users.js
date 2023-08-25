const pool = require('../index');

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  const queryString = `
    SELECT * FROM users
    WHERE email = $1
  `;
  return pool.query(queryString, [email])
  .then(res => {
    if (res.rows.length === 0) {
      return null;
    }
    console.log('success', res.rows[0]);
    return res.rows[0];
  })
  .catch(err => {
    console.error('query error', err.stack);
  });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  const queryString = `
    SELECT * FROM users
    WHERE id = $1
  `;
  return pool.query(queryString, [id])
  .then(res => {
    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0];
  })
  .catch(err => {
    console.error('query error', err.stack);
  });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const queryString = `
    INSERT INTO users (email, name, password)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  return pool.query(queryString, [user.email, user.name, user.password])
  .then(res => {
    return res.rows[0];
  })
  .catch(err => {
    return console.error('query error', err.stack);
  });

};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser
}