var express = require('express');
var router = express.Router();

var User = require('../models/user.js');

var Item = require('../models/item.js');


var jwt = require('jsonwebtoken');


router.post('/', function(req, res) {

  User.findOne({
    email: req.body.email
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Email was not found!' });
    } else if (user) {

      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Password does not match email!' });
      } else {

        var token = jwt.sign(user.id, req.app.get('api_secret'), {
          expiresIn: req.app.get('token_exire') 
        });


        res.json({
          success: true,
          message: 'Authentication successful!',
          token: token
        });
      }   

    }

  });
});




module.exports = router;
