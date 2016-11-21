var db = require('../databases/users.js');

module.exports = db.model('User', new require('mongoose').Schema({
	email: String, //email
	password: String, //password
	profile_picture: String, //Profile picture stored in static location
	display_name: String,
	conversations: [Number], //Conversations they are a part of
	items: [Number], //What they have for sale
	admin: Boolean //Are they adminstrators?
}));
