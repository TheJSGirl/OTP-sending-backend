const mainRoute = require('express').Router();
const contact = require('./readContacts');

mainRoute.use('/contacts', contact);
module.exports = mainRoute;
