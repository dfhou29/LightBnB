const properties = require("./json/properties.json");
const users = require("./json/users.json");

// use pg to make database connection
const {Pool} = require('pg');
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

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

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  const queryString = `
    SELECT * FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    WHERE guest_id = $1 LIMIT $2
  `;

  return pool.query(queryString, [guest_id, limit])
  .then( res => {
    return (res.rows);
  })
  .catch(err => {
    return console.error(err.stack);
  });
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {

  let queryString = `
    SELECT properties.id, title, cost_per_night, thumbnail_photo_url, cover_photo_url, avg(rating) AS average_rating
    FROM properties
           JOIN property_reviews ON properties.id = property_reviews.property_id
  `;

  const queryParams = [];
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length}`;
  }

  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    if (!queryString.includes('WHERE')) {
      queryString += `WHERE owner_id = $${queryParams.length}`;
    } else {
      queryString += `AND owner_id = $${queryParams.length}`;
    }
  }

  if (options.minimum_price_per_night && options.maximum_price_per_night) {

    queryParams.push(`${options.minimum_price_per_night}00`);
    queryParams.push(`${options.maximum_price_per_night}00`);
    if (!queryString.includes('WHERE')) {
      queryString += `WHERE cost_per_night BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`;
    } else {
      queryString += `AND cost_per_night BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`;
    }

  } else if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night}00`);
    if (!queryString.includes('WHERE')) {
      queryString += `WHERE cost_per_night >= $${queryParams.length}`;
    } else {
      queryString += `AND cost_per_night >= $${queryParams.length}`;
    }

  } else if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night}00`);
    if (!queryString.includes('WHERE')) {
      queryString += `WHERE cost_per_night <= $${queryParams.length}`;
    } else {
      queryString += `AND cost_per_night <= $${queryParams.length}`;
    }

  }

  queryString += `GROUP BY properties.id, title, cost_per_night `;

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += `HAVING avg(rating) >= $${queryParams.length}`;
  }

  queryParams.push(limit);
  queryString += `ORDER BY cost_per_night LIMIT $${queryParams.length}`;
 
  return pool.query(queryString, queryParams)
    .then((res) => {
      return res.rows;
    })
    .catch((err) => {
      console.error('query error', err.stack);
    });
};


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};