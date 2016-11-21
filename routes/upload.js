var express = require('express');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var router = express.Router();
var config = require('../config.js');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var Upload = require('../models/upload.js');



router.use(function(req, res, next){
var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (token) {

    jwt.verify(token, req.app.get('api_secret'), function(err, decoded) {      
      if (err) {
      	console.log(err);
        return res.json({ message: 'Failed to authenticate token.' });    
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



router.post('/', multipartMiddleware, function(req, res){
	var files = req.files;
	console.log(files.file);
	var upload = new Upload();
	var id = upload._id;


	fs.createReadStream(files.file.path).pipe(fs.createWriteStream(config.static_folder + id + ".png"));
	fs.unlink(files.file.path, function(err){
		if (err) throw err;
	})
	upload.url = config.site + "static/" + id + ".png";
	upload.userId = req.id;
	upload.save(function(err, user){
		if(err) throw err;

	});
	res.status(200);
	res.json({
		success: true,
		message: "File was uploaded successfully",
		url: upload.url
	})

});

module.exports = router;