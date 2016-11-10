var db = require('../databases/conversations.js');

module.exports =  db.model('Conversation', new require('mongoose').Schema({
	userStart: String,
	userWith: String,
	itemId: String, //item it is talking about
	messageCount: Number
}));