const crypto = require('crypto');
const jwt = require('jsonwebtoken');

var db = require('../helpers/db_helpers');

module.exports.controller = (app, io, socket_list) => {

    // Resgitro de usuário
    app.post('/api/register', async (req, res) => {
        let json;

        let { name, mode, email, password } = req.body;

        if (name && mode && email && password) {
            let response = await singUp(name, mode, email, await calculateHashAsync(password));

            if(response=="ER_DUP_ENTRY"){
                res.json({ msg: 'Email já utilizado!' })
            }else{  
                let userId = await getUserId(email);
                let token = generateToken(userId);
                json = {
                    auth: 'true',
                    token: token
                };
                res.status(201).json(json);
            }
        } else {
            res.status(400).json({ msg: 'Inclua os dados corretamente!' });
        }
    });

    // Login de usuário
    app.post('/api/login', async (req, res) => {
        let json;

        let { email, password } = req.body;
        
        if (email && password) {
            let userId = await getUserId(email);

            let token = await getToken(userId, email, await calculateHashAsync(password));

            if (token) {
                json = {
                    auth: 'true',
                    token: token,
                };
                res.json(json);
            } else {
                res.status(401).json({ msg: 'Dados invalidos!' });
            }

        } else {
            res.status(400).json({ msg: 'Inclua os dados corretamente!' });
        }
    });

}

async function getToken(id, email, password) {
    return new Promise((aceito, rejeitado) => {
        db.query('SELECT password FROM phoenix_beta_002.persons WHERE email=?', [email, password] , (error, results) => {
            if (error) { rejeitado(error); return; }
            if (results) {
                if (password != results[0].password) {
                    rejeitado();
                } else {  
                    let token = generateToken(id);

                    //console.log(id[0].id)

                    db.query('SELECT user_id from tokens where user_id=?', [id[0].id], (error, results) => {
                        if (error) { rejeitado(error); return; }
                        if (results) {
                            db.query('UPDATE tokens SET token=? WHERE user_id=?', [token, id[0].id])
                        } else {
                            db.query('INSERT INTO tokens (user_id, token) values (?, ?)', [id[0].id, token]);
                        }
                    });
    
                    aceito(token); // Cria e envia o token
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
        db.query('INSERT INTO phoenix_beta_002.persons (name, mode, email, password) values (?, ?, ?, ?)', [name, mode, email, password], (error, results) => {
            if(error) {rejeitado(error.code); return; }
            aceito(results);
        })
    })
    .catch(err => {
        return err;
    });
}

async function getUserId(email) {
    return new Promise((aceito, rejeitado) => {
        db.query('SELECT id FROM phoenix_beta_002.persons WHERE email=?', [email], (error, result) => {
            if (error) { rejeitado(error.code); return; }
            aceito(result);
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

function generateToken(id) {
    return jwt.sign({ userId: id }, process.env.SECRET, { expiresIn: 1200 }, { algorithm: 'RS256' });
}

// Verifica o token
module.exports.verifyJWT = (req, res, next) => {
    const token = req.headers['x-acess-token'];
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if(err) return res.status(401).end();
        req.userId = decoded.userId;
        next();
    })
}