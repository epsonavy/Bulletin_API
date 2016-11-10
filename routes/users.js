var express = require('express');
var jwt = require('jsonwebtoken');
var User = require('../models/user.js');
var router = express.Router();

router.use(function(req, res, next){
var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {


    // verifies secret and checks exp
    jwt.verify(token, req.app.get('api_secret'), function(err, decoded) {      
      if (err) {
      	console.log(err);
        return res.json({ message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.id = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
  }
});

router.get('/find', function(req, res, next) {

  User.findOne({
    _id : req.query.userId
  }, function(err, user){
    if(err) throw err;
    if(user){
        res.status(200);
        return res.json(user);
    }else{
      res.status(400);
      return res.json({
        success: false,
        message: "No user was found with that ID!"
      })
    }
  });
});

router.get('/', function(req, res, next) {

  var searchId = req.id;
  if(req.query.userId) searchId = req.query.userId;

  User.findOne({
    _id : searchId
  }, function(err, user){
    if(err) throw err;
    if(user){
        res.status(200);
        return res.json(user);
    }
  });
});

router.post('/update', function(req, res, next) {

  User.findOne({
    _id : req.id
  }, function(err, user){
    if(err) throw err;
    if(user){
        if(req.body.first_name) user.first_name = req.body.first_name;
        if(req.body.last_name) user.last_name = req.body.last_name;
        if(req.body.profile_picture) user.profile_picture = req.body.profile_picture;
        user.save(function(err){
          if(err) throw err;
        })
        res.status(200);
        return res.json(user);
    }
  });
});

module.exports = router;
