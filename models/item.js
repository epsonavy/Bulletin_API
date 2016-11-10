var db = require('../databases/items.js');

module.exports =  db.model('Item', new require('mongoose').Schema({
	userId: String,
	title: String,
	description: String,
	pictures: [String],
	price: Number,
	expiration: Number
}));