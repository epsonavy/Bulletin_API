var db = require('../databases/uploads.js');

module.exports = db.model('Upload', new require('mongoose').Schema({
	url: String, //email
}));
