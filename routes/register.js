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
			if(!req.body.password || !req.body.display_name){
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
					
					User.findOne({
						display_name: req.body.display_name
					}, function(err, nextUser){
						if (err) throw err;
						if(nextUser){
			res.status(400);
			return res.json({
				success: false,
				message: "This display name has been taken!"
			});
						}else{
							var n = new User({
						email: req.body.email,
						password: req.body.password,
						profile_picture: picture,
						deviceId: "default",
						display_name: req.body.display_name,
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
					});
				}
			}
		}
	});
});

router.get('/check/email', function(req, res, next){
	console.log(req.query.email);
	if (!req.query.email){
		res.status(418);
		res.json({
			success: false,
			message: "No email to check!"
		})
	}
	User.findOne({
		email: req.query.email
	}, function(err, user){
		if(err) throw err;

		if (user){
			res.status(200);
			res.json({
				success: true,
				message: "Email was found!"
			});
		}else{
			res.status(418);
			res.json({
				success: false,
				message: "No email was found!"
			});
		}
	});
});

router.get('/check/name', function(req, res, next){
	console.log(req.query.display_name);
	if (!req.query.display_name){
		res.status(418);
		res.json({
			success: false,
			message: "No display name to check!"
		})
	}
	User.findOne({
		display_name: req.query.display_name
	}, function(err, user){
		if(err) throw err;

		if (user){
			res.status(200);
			res.json({
				success: true,
				message: "Display name was found!"
			});
		}else{
			res.status(418);
			res.json({
				success: false,
				message: "No display name was found!"
			});
		}
	});
});

module.exports = router;
