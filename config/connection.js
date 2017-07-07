var mysql = require('mysql');
var config = require('./database');
var db;

function connectDatabase() {
    if (!db) {
        db = mysql.createConnection(config.database);

        db.connect(function(err){
            if(!err) {
                console.log("MYSQL database is connected!");
            } else {
                console.log("Error connecting to MYSQL database.");
            }
        });
    }
    return db;
}

module.exports = connectDatabase();