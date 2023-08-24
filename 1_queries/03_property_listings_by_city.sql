SELECT properties.id, title, cost_per_night, avg(rating) AS average_rating
FROM properties
       JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE city LIKE '%Vancouver'
GROUP BY properties.id, title, cost_per_night
HAVING avg(rating) >= 4
ORDER BY cost_per_night
LIMIT 10;