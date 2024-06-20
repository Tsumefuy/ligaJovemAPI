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
            console.log(userId)

            if (userId) {
                console.log(userId[0].user_id);
                db.query('SELECT * FROM persons WHERE id=?', [userId[0].user_id], (error, result) => {
                    if (error) { rejeitado(error.code); return; }
                    if (result) {
                        console.log(result);
                        json = {
                            auth: 'true',
                            name: result[0].name,
                            avatar: result[0].avatar
                        };
                        res.status(200).json(json);
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
