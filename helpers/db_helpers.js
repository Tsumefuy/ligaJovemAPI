const mysql = require('mysql2');
var db = require('../config/dbconn');
var helper = require('./helpers');
const fs = require('fs');
const { query } = require('express');

reconnect(db, () => {});

function reconnect(connection, callback) {
    helper.Dlog("\n New connection tentative ... (" + helper.serverDDMMYYYYHHmms() + ")");

    connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: process.env.DB_PORT,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        ssl: {
            ca: fs.readFileSync(__dirname + '/ca.pem'),
            rejectUnauthorized: false
        }
    });
    connection.connect((err) => {
        if (err) {
            helper.ThrowHtmlError(err);

            setTimeout( () => {
                helper.Dlog('DB Reconnecting Error (' + helper.serverDDMMYYYYHHmms() + ') ..............');

                reconnect(connection, callback);
            }, 5 * 1000);
        } else {
            helper.Dlog('\n\t New Connection established with database. ');
            db = connection;
            return callback();
        }
    })

    connection.on('error', (err) => {
        helper.Dlog('App is connection Crash DB Helper (' + helper.serverDDMMYYYYHHmms() + ')');

        let error_list = ["PROTOCOL_CONNECTION_LOST", "PROTOCOL_ENQUEUE_AFTER_QUIT", "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR", "PROTOCOL_ENQUEUE_HANDSHAKE_TWICE", "ECONNREFUSED", "PROTOCOL_PACKETS_OUT_OF_ORDER"];
        for (let i = 0; i < error_list.length; i++) {
            if (err.code === error_list[i]) {
                helper.Dlog("/!\\" + error_list[i]  + "Cannot establish a connection with the database. /!\\ (" + err.code + ")");
                reconnect(db, callback);
            } else if (i === error_list.length - 1) {
                throw err; 
            }
        }
        
    })
}

module.exports = {
    query: (sqlQuery, args, callback) => {
        if (db.state === 'authenticated' || db.state === "connected") {
            db.query(sqlQuery, args, (error, result) => {
                return callback(err, result);
            })
        } else if (db.state === "protcol_error") {
            reconnect(db, () => {
                db.query(sqlQuery, args, (error, result) => {
                    return callback(err, result);
                })
            })
        } else {
            reconnect(db, () => {
                db.query(sqlQuery, args, (error, result) => {
                    return callback(error, result);
                })
            })
        }
    }
}

process.on('uncaughtException', (err) => {
    helper.Dlog(' App is Crash DB helper (' + helper.serverDDMMYYYYHHmms +')');
    helper.Dlog(err.code);
    helper.ThrowHtmlError(err);
})