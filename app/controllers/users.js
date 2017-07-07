var passport	= require('passport');
var jwt = require('jsonwebtoken');
var db  = require('../../config/connection');

// bundle our routes
// http://teknosains.com/i/simple-crud-nodejs-mysql

module.exports = {
	// connect and get mysql data using express-myconnection middleware
    list: function(req, res){
        req.getConnection(function(err, connection){	
			connection.query('SELECT * FROM lots',function(err, rows) {		 
				if (err) return next("Cannot connect to mysql.");
				if (!rows) {
					return res.status(403).send({success: false, msg: err});
				} else {
					res.json({success: true, data: rows});
				}
			});
		});
    },
	// connect and get mysql data using mysql createConnection method
    listbids: function(req, res){
        db.query('SELECT * FROM bid', function(err, results) {
			if (err) throw err;
			if(!err) {
				res.json({success: true, data: results});
			}
		});
    }
};
