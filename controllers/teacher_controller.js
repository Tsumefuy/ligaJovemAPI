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
            let userId = await getUserId(token)[0];

            /*let person = db.query('SELECT * FROM phoenix_beta_002.tokens WHERE id=?', [id], (error, result) => {
                if (error) { rejeitado(error.code); return; }
                aceito(result);
            })*/

            if (userId) {
                json = {
                    auth: 'true',
                    token: token,
                    id: userId
                };
                res.status(200).json(json);
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
        db.query('SELECT user_id FROM phoenix_beta_002.tokens WHERE token=?', [token], (error, result) => {
            if (error) { rejeitado(error.code); return; }
            aceito(result);
        })
    })
    .catch(err => {
        return err;
    });
}
