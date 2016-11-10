var express = require('express');
var jwt = require('jsonwebtoken');
var config = require('../config.js');
var User = require('../models/user.js');
var router = express.Router();

router.post('/', function(req, res, next) {
	var foundUser = false;
	User.findOne({
		email: req.body.email
	}, function(err, user){
		if(err) throw err;
		if(user)  {
			res.status(400);
			return res.json({
				success: false,
				message: "This email has already been registered!"
			});
		}else{
			if(!req.body.password || !req.body.first_name || !req.body.last_name){
				res.status(400);
				return res.json({
					success: false,
					message: "Some fields are missing"
				})
			}else{
				if(req.body.password.length < 3){
					res.status(400);
					return res.json({
					success: false,
					message: "Password is too short in length"
				});
				}else{
					var picture = config.default_picture;
					if(req.body.profile_picture)
						picture = req.body.profile_picture;
					
					var n = new User({
						email: req.body.email,
						password: req.body.password,
						profile_picture: picture,
						first_name: req.body.first_name,
						last_name: req.body.last_name,
						conversations: [],
						items: [],
						admin: false
					})

					n.save(function(err){
						if (err) throw err;
						res.status(200);
						return res.json({
							success: true,
							message: "Registration successful!"
						});
					});
				}
			}
		}
	});
});

module.exports = router;
