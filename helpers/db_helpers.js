var mysql = require('mysql');
var config = require('config');
var dbConfig = config.get('DbConfig');
var db = mysql.createConnection(dbConfig);
var helper = require('./helpers');
const { query } = require('express');

if (config.has('optionalFeature.detail')) {
    var detail = config.get('optionalFeature.detail');
    helper.Dlog('config: ' + detail);
}

reconnect(db, () => {});

function reconnect(connection, callback) {
    helper.Dlog("\n New connection tentative ... (" + helper.serverDDMMYYYYHHmms() + ")");

    connection = mysql.createConnection(dbConfig);
    connection.connect( (err) => {
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
            } else if (i == error_list.length - 1) {
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
                    return callback(err, result);
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