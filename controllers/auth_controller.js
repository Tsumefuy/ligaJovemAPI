const crypto = require('crypto');
const jwt = require('jsonwebtoken');

var db = require('../helpers/db_helpers');

module.exports.controller = (app) => {

    // Resgitro de usuário
    app.post('/api/register', async (req, res) => {
        let json;

        let { name, mode, email, password } = req.body;

        if (name && mode && email && password) {
            let response = await singUp(name, mode, email, await calculateHashAsync(password));

            if(response=="ER_DUP_ENTRY"){
                res.status(401).json({ msg: 'Email já utilizado!' });
            }else{  
                let userId = await getUserId(email);
                let token = await getToken(userId[0].id, email, await calculateHashAsync(password));
                json = {    
                    auth: 'true',
                    description: 'register successful',
                    token: token
                };
                res.status(201).json(json);
            }
        } else {
            res.status(400).end();
        }
    });

    // Login de usuário
    app.post('/api/login', async (req, res) => {
        let json;

        let { email, password } = req.body;

        if (email && password) {
            let user = await getUserId(email); 

            if (user) { // Se o usuário existir
                let token = await getToken(user[0].id, email, await calculateHashAsync(password));

                if (token) {
                    json = {
                        auth: 'true',
                        description: 'login successful',
                        token: token,
                    };
                    res.json(json);
                } else {
                    res.status(401).json({ msg: 'Senha invalida!' });
                }
            } else {
                res.status(401).json({ msg: 'Usuário inexistente!' });
            }
        } else {
            res.status(400).end();
        }
    });

    app.post('/api/auth', async (req, res) => {
        const token = req.headers['authorization'];

        if (token) {
            jwt.verify(token, process.env.SECRET, async (err, decoded) => {
                if(err) { 
                    let id = await getUserIdBytoken(token);

                    if (id) { 
                        let user_login = await getEmailPasswordById(id[0].user_id);
                        if (user_login) {
                            let token = await getToken(id[0].user_id, user_login[0].email, user_login[0].password);
                            if (token) {
                                res.json({
                                    auth: 'true',
                                    description: 'login successful by new token',
                                    token: token,
                                });
                            } else {
                                res.status(401).end();
                            }
                        } else {
                            res.status(401).end();
                        }
                    } else {
                        res.status(401).end();
                    }
                } 
                if (decoded) {
                    let isCurrentTokenDB = await getCurrentTokenDB(token);
                    if (isCurrentTokenDB) {
                        res.json({
                            auth: 'true',
                            description: 'login successful by token',
                            token: token,
                        });
                    } else {
                        res.status(401).end();
                    }
                }
            })
        } else {
            res.status(401).end();
        }
    })
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

                    db.query('SELECT user_id from tokens where user_id=?', [id], (error, results) => {
                        if (error) { rejeitado(error); return; }
                        if (results[0]) {

                            db.query('UPDATE tokens SET token=? WHERE user_id=?', [token, id], (error, result) => {
                                if (error) { rejeitado(error); return; }
                            });

                        } else {

                            db.query('INSERT INTO tokens (user_id, token) values (?, ?)', [id, token], (error, result) => {
                                if (error) { rejeitado(error); return; }
                            });

                        }
                    });
    
                    aceito(token); // Cria e envia o token
                }
            } else {
                rejeitado();
            }
        });
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
        });
    })
    .catch(err => {
        return err;
    });
}

async function getCurrentTokenDB(token) {
    return new Promise((aceito, rejeitado) => {
        db.query('SELECT token FROM tokens WHERE token=?', [token], (error, result) => {
            if (error) { rejeitado(error.code); return; }
            if (result.length > 0) {
                aceito(result); // usuário existe
            } else {
                rejeitado(false); // usuário inexistente
            }
        })
    })
    .catch((err) => {
        return err;
    });
}

async function getEmailPasswordById(id) {
    return new Promise((aceito, rejeitado) => {
        db.query('SELECT email, password FROM phoenix_beta_002.persons WHERE id=?', [id], (error, results) => {
            if (error) { rejeitado(error.code); return; }
            aceito(results);
        });
    })
    .catch((err) => {
        return err;
    });
}

async function getUserId(email) {
    return new Promise((aceito, rejeitado) => {
        db.query('SELECT id FROM phoenix_beta_002.persons WHERE email=?', [email], (error, result) => {
            if (error) { rejeitado(error.code); return; }
            if (result.length > 0) {
                aceito(result); // usuário existe
            } else {
                rejeitado(false); // usuário inexistente
            }
        });
    })
    .catch(err => {
        return err;
    });
}

async function getUserIdBytoken(token) {
    return new Promise((aceito, rejeitado) => {
        db.query('SELECT user_id FROM phoenix_beta_002.tokens WHERE token=?', [token], (error, result) => {
            if (error) { rejeitado(error.code); return; }
            if (result.length > 0) {
                aceito(result); // usuário existe
            } else {
                rejeitado(false); // usuário inexistente
            }
        });
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
    const token = req.header['x-acess-token'];
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if(err) return res.status(401).end();
        next();
    })
}