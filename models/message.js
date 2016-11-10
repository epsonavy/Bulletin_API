var db = require('../databases/messages.js');

module.exports =  db.model('Message', new require('mongoose').Schema({
	conversationId: String,
	userId: String,
	timestamp: Number,
	messageIndex: Number,
	message: String
}));