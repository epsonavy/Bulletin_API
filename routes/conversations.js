var express = require('express');
var jwt = require('jsonwebtoken');
var Message = require('../models/message.js');
var User = require('../models/user.js');
var Conversation = require('../models/conversation.js');
var Item = require('../models/item.js');
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
router.get('/', function(req, res, next) {
  //retrieves the users conversations
  if(req.query.conversationId){
      Conversation.findOne({
    _id: req.query.conversationId,
    $or: [{userStart: req.id}, {userWith: req.id}]
  }, function(err, conversation){
    if(err) throw err;

    if(conversation){
      res.status(200);
      return res.json(conversation);
    }else{
      res.status(418);
      return res.json({
        success: true,
        message: "Unable to find a conversation by that ID!"
      });
    }
  })
  }else{
      Conversation.find({
        $or: [{userStart: req.id}, {userWith: req.id}]
      }, function(err, conversations){
        if(err) throw err;
        if(conversations.length > 0){
            res.status(200);
            return res.json(conversations);
        }else{
            res.status(418);
            return res.json({
              success: false,
              message: "You have no conversations!"
            });
        }
      })
  }
});

router.post('/new', function(req, res){
  Conversation.findOne({
    $or: [{userStart: req.id}, {userFrom: req.id}],
    itemId: req.body.itemId
  }, function(err, conversation){
    if(err) throw err;
    if(conversation){
      //do not make a new conversation if it already exists
      res.status(400);
      return res.json({
        success: false,
        message: "A conversation already exists with this item and user"
      })
    }else{
      var valid = true;
      if(!req.body.itemId) valid = false;
      if(!valid){
        res.status(400);
        return res.json({
          success: false,
          message: "Please specify an item you'd like to have a conversation about!"
        });

      }else{
        Item.findOne({
          _id: req.body.itemId
        }, function(err, item){
          if(err) throw err;
          if(item){
            User.findOne({
              _id: req.id
            }, function(err, userSelf){
              if (err) throw err;
              if (userSelf){
                User.findOne({
                  _id: item.userId
                }, function(err, userWith){
                  if (err) throw err;
                  if(userWith){
                    var n = new Conversation({
                userStart: req.id,
                userWith: item.userId,
                userWithProfilePicture: userWith.profile_picture,
                userWithName: userWith.display_name,
                userStartName: userSelf.display_name,
                userStartProfilePicture: userSelf.profile_picture,
                itemTitle: item.title,
                itemPrice: item.price,
                itemDescription: item.description,
                itemId: item._id,
                lastMessage: "Start your conversation!",
                lastTimestamp: (new Date).getTime(),
                messageCount: 0
            });
            n.save(function(err){
              if(err) throw err;
              res.status(200);
              return res.json(n);
            });

                  }
                });
              }
            });
          }else{
            res.status(418);
            return res.json({
              success: false,
              message: "There is no item you'd like to have a conversation about!"
            });
          }
        })
      }

    }
  });
});
//get messages
router.get('/messages', function(req, res){
  var valid = true;
  if(!req.query.conversationId) valid = false;
  if(!req.query.from) valid = false;
    if(!valid){
      res.status(400);
      return res.json({
        success: false,
        message: "Missing arguments to get messages from a conversation!"
      });
    }

  if(req.query.to){
    //with a to specifier
    console.log(req.query.from +" from " );
    console.log(req.query.to + " to");
    Message.find({
      $and: [ { messageIndex: { $lte: req.query.to}}, {messageIndex: { $gte: req.query.from}}],
      conversationId: req.query.conversationId
    }, function(err, messages){
      if(err) throw err;

      if(messages.length > 0){
        res.status(200);
        return res.json(messages);
      }else{
        res.status(418);
        return res.json({
          success: true,
          message: "No messages found for that range!"
        });

      }

    });


  }else{
    Message.find({
      messageIndex: { $gte: req.query.from },
      conversationId: req.query.conversationId
    }, function(err, messages){
      if(err) throw err;

      if(messages.length > 0){
        res.status(200);
        return res.json(messages);
      }else{
        res.status(418);
        return res.json({
          success: true,
          message: "No messages found for that range!"
        });

      }

    });
    //with only a from specifier.

  }

});
//post a message
router.post('/messages', function(req, res){
  var valid = true;
  if(!req.body.conversationId) valid = false;
  if(!req.body.message) valid = false;

  if(!valid){
    res.status(400);
    return res.json({
      success: false,
      message: "Missing arguments to post a message on a conversation!"
    });
  }

  Conversation.findOne({
    _id: req.body.conversationId
  }, function(err, conversation){
    if(err) throw err;
    if(conversation){
      conversation.lastMessage = req.body.message
      conversation.lastTimestamp = (new Date).getTime()
      var n = new Message({
        userId: req.id,
        conversationId: conversation._id,
        timestamp: (new Date).getTime(),
        messageIndex: ++conversation.messageCount,
        message: req.body.message
      });

      n.save(function(err){
        if(err) throw err;

        conversation.save(function(err){
          if(err) throw err;

          res.status(200);
          return res.json(n);
        });
      });
    }else{
      res.status(400);
      return res.json({
        success: false,
        message: "Could not find a conversation with that ID!"
      })
    }
  });



});

module.exports = router;
