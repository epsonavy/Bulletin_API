var express = require('express');
var router = express.Router();
var User = require('../models/user.js');


router.use(function(req, res, next){
var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, req.app.get('api_secret'), function(err, decoded) {      
      if (err) {
      	console.log(err);
        return res.status(403).json({ message: 'Failed to authenticate token.' });    
      } else {
        req.id = decoded;
        next();
      }
    });

  } else {
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
  }
});

router.post('/register', function(req, res){
	if(req.body.deviceId){
		User.findOne({ _id : req.id}, function(err, user){
			user.deviceId = req.body.deviceId
			user.save(function(err){
         	 if(err) throw err;
        	})
       	 	res.status(200);
        	return res.json(user);
		});
	}else{
		res.status(400);
		res.json({success: false, message: 'Could not register device for notifications!'});
	}
});

router.get('/unregister', function(req, res){
		User.findOne({ _id : req.id}, function(err, user){
			user.deviceId = "default"
			user.save(function(err){
         	 if(err) throw err;
        	})
       	 	res.status(200);
        	return res.json(user);
		});
});

module.exports = router