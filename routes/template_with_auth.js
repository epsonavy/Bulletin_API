var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();

router.use(function(req, res, next){
var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {


    // verifies secret and checks exp
    jwt.verify(token, req.app.get('api_secret'), function(err, decoded) {      
      if (err) {
      	console.log(err);
        return res.status(403).json({ message: 'Failed to authenticate token.' });    
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
router.get('/', function(req, res, next) {

  console.log(req.id);
  res.send('respond with a resource');
});

module.exports = router;
