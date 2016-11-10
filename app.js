var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var auth = require('./routes/auth');
var users = require('./routes/users');
var register = require('./routes/register')
var items = require('./routes/items');
var conversations = require('./routes/conversations');
var upload = require('./routes/upload');

var toobusy = require('toobusy-js');

var dbConfig = require('./db.js');

var config = require('./config.js');


var session = require('express-session');


var app = express();
app.set('api_secret', config.secret);
app.set('token_expire', config.token_expire);
app.use(session({secret: config.secret}));


var User = require('./models/user.js');
var Item = require('./models/item.js');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/auth', auth);
app.use('/register', register);
app.use('/users', users);
app.use('/items', items);
app.use('/conversations', conversations);
app.use('/upload', upload);

app.get('/fakeUser', function(req, res) {

  // create a sample user
  var nick = new User({ 
    email: 'long.trinh@sjsu.edu', 
    password: 'Wierdo12!',
    profile_picture: 'dog.png',
    first_name: 'Kevin',
    last_name: 'Trinh',
    conversations: [],
    items: [],
    admin: true 
  });

  console.log("attempting to save user");
  // save the sample user
  nick.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });



});

app.get('/fakeItems', function(req, res){
  var item = new Item({
    userId: '5821bcf612ffd866d5023532',
    title: 'Calculus Book, Fundamental Stewart',
    description: 'This book is used for MATH30, 31, and I think 32.. Pretty cheap if you need to take all those three classes',
    pictures: ['gay.png', 'dog.png'],
    price: 24.99,
    expiration: 1478730191
  });

  item.save(function(err){
    if(err) throw err;

    res.json({success: true});
  })
});

app.use(function(req, res, next) {
  if (toobusy()) {
    res.send(503, "I'm busy right now, sorry.");
  } else {
    next();
  }
});

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
