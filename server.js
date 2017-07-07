var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var connection  = require('express-myconnection'); 
var mysql = require('mysql');
var mongoose    = require('mongoose');
mongoose.Promise = global.Promise;
var passport	= require('passport');
var config      = require('./config/database'); // get db config file
var User        = require('./app/models/user'); // get the mongoose model
var port        = process.env.PORT || 9000;
var jwt = require('jsonwebtoken');
var multer = require('multer');
var fs = require('fs');
var cors = require('cors');
var nodemailer = require('nodemailer'); 

var storageUser = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
var uploadUser = multer({ //multer settings
    storage: storageUser
}).single('file');


//cors enable
app.use(cors());

// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
 
// log to console
app.use(morgan('dev'));
 
// Use the passport package in our application
app.use(passport.initialize());
 
// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header('Access-Control-Allow-Credentials', true);
  next();
});


// demo Route (GET http://localhost:8080)
app.get('/', function(req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});
 
// Start the server
app.listen(port);
//console.log('There will be dragons: http://localhost:' + port);

app.use(connection(mysql, config.database, 'request'));
 
// pass passport for configuration
require('./config/passport')(passport);
 
// bundle our routes
var apiRoutes = express.Router();

//define route constant
const userController = require('./app/controllers/users');

// users routes
//apiRoutes.get('/users', config.isAuthenticated, userController.list);
apiRoutes.get('/lots', userController.list);
apiRoutes.get('/bids', userController.listbids);


// route to authenticate a user (POST http://localhost:8080/api/login)
apiRoutes.post('/login', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
 
    if (!user) {
      res.send({success: false, msg: 'Authentication failed. Username not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.sign(user, config.secret, {
            expiresIn: 30000 // expires in 1 minute
          });
          //var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: token});
        } else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

// jwt token check
/*app.all('/api/*', function (req, res, next) {
	console.log('filter');
	var token = getToken(req.headers);
	if (token) {
		// verifies secret and checks exp
		var decoded = jwt.decode(token, config.secret, {complete: true});
		jwt.verify(token, config.secret, function(err, decoded) {      
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });    
			} else {
				// if everything is good, pass request to next
				next();			
			}
		});
	} else {
		return res.status(403).send({success: false, msg: 'No token provided.'});
	}
	
});*/

// connect the api routes under /api/*
app.use('/api', apiRoutes);