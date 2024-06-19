const crypto = require('crypto');

var db = require('../helpers/db_helpers');
var helper = require('../helpers/helpers');


module.exports.controller = (app, io, socket_list) => {

    app.post('/api/register', async (req, res) => {
        let json = {error:'', result:[]};
        helper.Dlog(req.body);

        let { name, mode, email, password } = req.body;

        if (name && mode && email && password) {
            let response = await singUp(name, mode, email, await calculateHashAsync(password));

            if(response=="ER_DUP_ENTRY"){
                json.error = "Email já utilizado!";
            }else{
                json.result = {
                    response: response,
                    token: helper.createRequestToken()
                };
            }
        } else {
            json.error = "Inclua os dados corretamente!";
        }

        res.json(json);
    });

    app.get('/api/auth', async (req, res) => {
        let json = {error:'', result:[]};
        helper.Dlog(req.body);

        let { email, password } = req.body;
        
        if (email && password) {
            let userData = await getTokenAndUserData(email, await calculateHashAsync(password));

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

        } else {
            json.error = "Inclua os dados corretamente!";
        }

        res.json(json);
    });

}

async function getTokenAndUserData(email, password) {
    return new Promise((aceito, rejeitado) => {
        db.query('SELECT email, password, name, mode, avatar FROM phoenix_beta_002.persons WHERE email=?', [email, password] , (error, results) => {
            if (error) { rejeitado(error); return; }
            if (results) {
                if (password != results[0].password) {
                    rejeitado();
                } else {   
                    let user_list = [results[0].name, results[0].mode, results[0].avatar, helper.createRequestToken()];
                    aceito(user_list); //Envia os dados do usuário e cria o token
                }
            } else {
                rejeitado();
            }
        })
    })
    .catch((err) => {
        return err;
    });
}

async function singUp(name, mode, email, password) {
    return new Promise((aceito, rejeitado) => {
        db.query('INSERT INTO  phoenix_beta_002.persons (name, mode, email, password) values (?, ?, ?, ?)', [name, mode, email, password], (error, results) => {
            if(error) {rejeitado(error.code); return; };
            aceito(results);
        })
    })
    .catch(err => {
        return err;
    });
}

async function calculateHashAsync(plaintext) {
    const hashStream = crypto.createHash('sha256');
    
    // Alimenta o stream com a mensagem
    hashStream.update(plaintext);
    
    // Finaliza o cálculo do hash 
    const hash = hashStream.digest('hex');

    return hash;
}