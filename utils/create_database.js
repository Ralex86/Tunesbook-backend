/**
 *** Created by Ralex
 ***/
var mysql = require('mysql');
var dbconfig = require('../database');
var connection = mysql.createConnection(dbconfig.connection);
var NEW_TABLE = process.argv[2]

connection.query(`USE ${dbconfig.database}`);

connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + NEW_TABLE + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `T` VARCHAR(100), \
    `R` VARCHAR(50), \
    `M` VARCHAR(50), \
    `K` VARCHAR(50), \
    `body` VARCHAR(500), \
    PRIMARY KEY (`id`) \
)');


// for some reason can't create this table with foreign constrain
connection.query(`
CREATE TABLE SVG${NEW_TABLE} ( 
    id int NOT NULL AUTO_INCREMENT,
    tuneID int,
    svg text,
    PRIMARY KEY (id),
    FOREIGN KEY (tuneID) REFERENCES ${NEW_TABLE}(id)
)`);

console.log('Success: Database Created!')

connection.end()
