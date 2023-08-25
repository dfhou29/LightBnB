const pool = require('../index');

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {

  let queryString = `
    SELECT properties.id, title, cost_per_night, thumbnail_photo_url, cover_photo_url, number_of_bedrooms, number_of_bathrooms, parking_spaces, avg(rating) AS average_rating
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

  queryString += `GROUP BY properties.id, title, cost_per_night, thumbnail_photo_url, cover_photo_url `;

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
  console.log(property);
  let queryParams = [];
  const keys = Object.keys(property);
  property.cost_per_night += '00';

  for (const key of keys) {
    queryParams.push(property[key]);
  }
  const queryString = `
    INSERT INTO properties (title, description, number_of_bedrooms, number_of_bathrooms, parking_spaces, cost_per_night, thumbnail_photo_url, cover_photo_url, street, country, city, province, post_code, owner_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;
  `;

  return pool.query(queryString, queryParams)
  .then(res => {
    console.log(res.rows[0]);
    return res.rows[0];
  })
  .catch(err => {
    return console.error(err.stack);
  });
};

module.exports = {
  getAllProperties,
  addProperty
};