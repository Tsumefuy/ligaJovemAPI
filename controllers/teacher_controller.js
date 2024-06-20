const crypto = require('crypto');
const jwt = require('jsonwebtoken');

var db = require('../helpers/db_helpers');
var authController = require('./auth_controller.js');

module.exports.controller = (app, io, socket_list) => {

    // Login de usuário
    app.post('/api/teacher', async (req, res) => {
        let json;

        let { token } = req.body;
        
        if (token) {
            let userId = await getUserId(token);

            if (userId) {
                db.query('SELECT * FROM persons WHERE id=?', [userId[0].user_id], (error, result_user) => {
                    if (error) { rejeitado(error.code); return; }
                    if (result_user[0]) {
                        let dataAtual = new Date();
                        let ano = dataAtual.getFullYear();
                        let mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
                        let dia = String(dataAtual.getDate()).padStart(2, '0');

                        let dateF = `${ano}/${mes}/${dia}`;

                        db.query('select loc, init, room_id from connection where user_id = ? and day > ? order by day asc, init asc limit 1;', [userId[0].user_id, dateF], (error, result_room) => {
                            if (error) { rejeitado(error.code); return; }
                            if (result_room[0]) {
                                json = {
                                    auth: 'true',
                                    name: result_user[0].name,
                                    avatar: result_user[0].avatar,
                                    mode: result_user[0].mode,
                                    next_class: {
                                        init: result_room[0].init,
                                        local: result_room[0].loc,
                                        class: result_room[0].room_id
                                    }
                                };
                                console.log(json);

                                res.status(200).json(json);
                            } else {
                                json = {
                                    auth: 'true',
                                    name: result_user[0].name,
                                    avatar: result_user[0].avatar,
                                    mode: result_user[0].mode,
                                    next_class: {
                                        init: "A definir",
                                        local: "A definir",
                                        class: "A definir"
                                    }
                                };
                                res.status(200).json(json);
                            }
                        });
                    } else {
                        res.status(401).json({ msg: 'Usuáro não encontrado' });
                    }
                })
            } else {
                res.status(401).json({ msg: 'Token invalido!' });
            }

        } else {
            res.status(400).json({ msg: 'Inclua os dados corretamente!' });
        }
    });

}


async function getUserId(token) {
    return new Promise((aceito, rejeitado) => {
        db.query('SELECT user_id FROM tokens WHERE token=?', [token], (error, result) => {
            if (error) { rejeitado(error.code); return; }
            aceito(result);
        })
    })
    .catch(err => {
        return err;
    });
}
