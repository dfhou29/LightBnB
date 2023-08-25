const pool = require('../index');

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

module.exports = {
  getAllReservations
};