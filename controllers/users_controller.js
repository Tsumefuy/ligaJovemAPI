const { relativeTimeRounding } = require('moment-timezone');
var db = require('../helpers/db_helpers');
var helper = require('../helpers/helpers');
var multiparty = require('multiparty');

module.exports.controller = (app, io, socket_list) => {
    
    app.get('/api/auth', async (req, res) => {
        let json = {error:'', result:[]};

        if (req.body.email == "" || req.body.password == "") {
            json.error = "Inclua os dados corretamente!"
            res.json(json);
        }

        let userData = await getTokenAndUserData(req.body.email, req.body.password);

        if (userData) {
            json.result.push({
                name: userData[0],
                mode: userData[1],
                avatar: userData[2],
                token: userData[3],
            });
        } else {
            json.error = "Dados invalidos!";
        }

        res.json(json);
    })
}

async function getTokenAndUserData(email, password) {
    return new Promise((aceito, rejeitado) => {
        db.query('SELECT email, password, name, mode, avatar FROM phoenix_beta_001.persons WHERE email=?', [email, password] , (error, results) => {
            if (error) { rejeitado(error); return; }
            if (results) {
                if (password != results[0].password) {
                    rejeitado('Senha errada');
                } else {   
                    let user_list = [results[0].name, results[0].mode, results[0].avatar, helper.createRequestToken()];
                    aceito(user_list); //Cria os dados do usuário, incluindo o token
                }
            } else {
                rejeitado('Email invalido!');
            }
        })
    })
    .catch((err) => {
        console.error('Erro:', err);
    });
}