const { promisify } = require('util');
const db = require('../config/db');

const query = promisify(db.query).bind(db);

module.exports = { query };
