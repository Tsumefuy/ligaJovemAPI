var moment = require('moment-timezone');
var fs = require('fs');

const app_debug_mode = false;
const timezone_name= "America/Bahia";
const msg_server_internal_error = "Server Internal Error";

module.exports = {

    ThrowHtmlError: (err, res) => {

        Dlog("App is Helpers Throw Crash(" + serverDDMMYYYYHHmms + ")");
        Dlog(err.stack);

        fs.appendFile('./crash_logs/Crash' + server_dateTime('DD-MM-YYYY HH mm ss') + '.txt', err.stack, (err) => {
            if (err) {
                Dlog(err);
            }
        })

        if (res) {
            res.json({'status': '0', "message": msg_server_internal_error});
            return;
        }
    },

    ThrowSocketError: (err, client, event_name) => {

        Dlog("App is Helpers Throw Crash(" + serverDDMMYYYYHHmms + ")");
        Dlog(err.stack);

        fs.appendFile('./crash_logs/Crash' + server_dateTime('DD-MM-YYYY HH mm ss') + '.txt', err.stack, (err) => {
            if (err) {
                Dlog(err);
            }
        })

        if (client) {
            client.emit(event_name, {'status': '0', "message": msg_server_internal_error});
            return;
        }
    },

    CheckParameterValid: (res, jsonObj, checkKeys, callback) => {

        var isValid = true;
        var missingParameter = "";

        checkKeys.forEach( (key, indexOf) => {
            if (!Object.prototype.hasOwnProperty.call(jsonObj, key)) {
                isValid = false;
                missingParameter += key + " ";
            }
        });

        if (!isValid) {

            if (!app_debug_mode) {
                missingParameter = "";
            }

            res.json({'status': '0', "message": "Missing parameter (" + missingParameter + ")"});
        } else {
            return callback();
        }
    }, 

    CheckParameterValidSocket: (client, event_name, jsonObj, checkKeys, callback) => {

        var isValid = true;
        var missingParameter = "";

        checkKeys.forEach( (key, indexOf) => {
            if (!Object.prototype.hasOwnProperty.call(jsonObj, key)) {
                isValid = false;
                missingParameter += key + " ";
            }
        });

        if (!isValid) {

            if (!app_debug_mode) {
                missingParameter = "";
            }
            client.emit(event_name, {'status': '0', "message": "Missing parameter (" + missingParameter + ")"});
        } else {
            return callback();
        }
    },

    createRequestToken: () => {
        var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var result = '';
        for (let i = 20; i > 0; i--) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }

        return result;
    },

    Dlog: (log) => {
        return Dlog(log);
    },

    server_dateTime: (format) => {
        return server_dateTime(format);
    },

    serverDDMMYYYYHHmms: () => {
        return serverDDMMYYYYHHmms();
    }
}

function server_dateTime(format) {
    var jun = moment(new Date());
    jun.tz(timezone_name).format();
    return jun.format(format);
}

function Dlog(log) {
    if (app_debug_mode) {
        console.log(log);
    }
}

function serverDDMMYYYYHHmms() {
    return server_dateTime('DD-MM-YYYY HH:mm:ss');
}

process.on('uncaughtException', (err) => {

})