var db = require('../databases/conversations.js');

module.exports =  db.model('Conversation', new require('mongoose').Schema({
	userStart: String,
	userWith: String,
	itemId: String, //item it is talking about
	itemPicture: String,
	itemTitle: String,
	itemDescription: String,
	itemPrice: Number,
	messageCount: Number,
	lastMessage: String,
	lastTimestamp: String,
	userStartName: String,
	userStartProfilePicture: String,
	userWithName: String,
	userWithProfilePicture: String
}));