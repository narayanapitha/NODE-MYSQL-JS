require('dotenv').config()
var passport	= require('passport');

module.exports = {
  secret: 'secrectkey',
  database: {
	  host     : 'localhost',
	  user     : 'root',
	  password : '',
	  port : 3306,
	  database : 'rings'
	}
};

module.exports.isAuthenticated = passport.authenticate('jwt', { session : false });
