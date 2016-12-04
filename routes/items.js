var express = require('express');
var jwt = require('jsonwebtoken');
var Item = require('../models/item.js');
var User = require('../models/user.js');
var config = require('../config.js');
var router = express.Router();

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

router.get('/all', function(req, res, next){
  Item.find({}, function(err, items){
    if(err) throw err;

    if(items){
      res.status(200);
      return res.json(items);
    }
  })
});


router.get('/', function(req, res, next) {
  if(req.query.itemId){
        Item.findOne({
        _id : req.query.itemId
      }, function(err, item){
        if(err) throw err;
        if(item){
            res.status(200);
            return res.json(item);
        }else{
          res.status(400);
          return res.json({
            success: false,
            message: "No item was found with that ID!"
          })
        }
      });
    }else{
      console.log(req.id);
      Item.find({
      userId : req.id
    }, function(err, items){
      if(err) throw err;
      if(items.length > 0){
          res.status(200);
          return res.json(items);
      }else{
        res.status(418);
        return res.json({
          success: true,
          message: "You have no items to display!"
        })
      }
    });
    }
});

router.post('/update', function(req, res, next) {
        Item.findOne({
        _id : req.query.itemId,
        userId: req.id
      }, function(err, item){
        if(err) throw err;
        if(item){
            if(req.body.title)  item.title = req.body.title;
            if(req.body.description) item.description = req.body.description;
            if(req.body.price) item.price = req.body.price;
            if(req.body.pictures) item.pictures = req.body.pictures;
            if(req.body.expiration) item.expiration = req.body.expiration;
            item.save(function(err){
              if(err) throw err;
            })
            res.status(200);
            return res.json(item);
        }else{
          res.status(400);
          return res.json({
            success: false,
            message: "The item does not belong to you or it could not be found!"
          })
        }
      });
});

router.post('/new', function(req, res, next){
  var valid = true;

  var pictures = req.body.pictures;

  var expiration = req.body.expiration;

  if(!req.body.title) valid = false;
  if(!req.body.description) valid = false;
  if(!req.body.price) valid = false;
  if(!req.body.pictures){
    pictures = config.default_item_picture;
  }
  if(!req.body.expiration){
      expiration = (new Date).getTime() + config.default_expiration; //default at 7 days
  }

  if(!valid){
    res.status(400);
    return res.json({
      success: false,
      message: "Missing arguments to create an item!"
    })
  }


  User.findOne({
  	_id: req.id
  }, function(err, user){
  	if (err) throw err;
  	if (user){
  		  var n = new Item({
    userId: req.id,
    title: req.body.title,
    description: req.body.description,
    pictures: pictures,
    expiration: expiration,
    price: req.body.price,
    user: req.id,
    userName: user.display_name,
    userPicture: user.profile_picture

  }, function(err, item){
    if(err) throw err;
  });
  		  n.save(function(err){
        if(err) throw err;
          res.status(200);
          res.json(n);
    });

  	}

  })






});

module.exports = router;
