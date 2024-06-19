var helper = require('./../helpers/helpers');
var db = require('./../helpers/db_helpers');

module.exports.controller = (app, io, socket_list) => {
    var json = {error:[], result:[]};

    io.on('connection', (client) => {
        client.on('UpdateSocket', (data) => {
            helper.Dlog('UpdateSocket :-' + data);
            var jsonObj = JSON.parse(data);

            helper.CheckParameterValidSocket(client, "UpdateSocket", jsonObj, ['user_id'], () => {
                db.query('SELECT id, email FROM phoenix_beta_001.persons WHERE id=?', [jsonObj.user_id]), (err, result) => {
                    if (err) {
                        helper.ThrowSocketError(err, client , "UpdateSocket");
                        return;
                    }
                    if (result.length > 0 ) {
                        socket_list['us_' + jsonObj.user_id] = { 'socket_id': client.id };

                        helper.Dlog(socket_list);

                        json.result.push = {
                            "status": "1",
                            "message": "Sucess!"
                        }
                    } else {
                        json.error.push = {
                            "status": "0",
                            "message": "Error!"
                        }
                    } 
                    client.emit('UpdateSocket', json);
                }
            })
        })
    })
}