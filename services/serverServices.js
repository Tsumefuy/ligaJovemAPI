const crypto = require('crypto');
const jwt = require('jsonwebtoken');
//var db = require('../helpers/db_helpers');
var db = require('../config/dbconn');

async function getToken(id, email, password) {
    return new Promise((aceito, rejeitado) => {
        db.query('SELECT password FROM phoenix_beta_002.persons WHERE email=?', [email, password] , async (error, results) => {
            if (error) { rejeitado(error); return; }
            if (results) {
                if (password != results[0].password) {
                    rejeitado(false);
                } else {  
                    let token = generateToken(id); // Cria o token
                    let saved = await saveToken(id, token);
                    if (saved) {
                        aceito(token);  // Envia o token
                    } else {
                        rejeitado(false);
                    } 
                }
            } else {
                rejeitado(false);
            }
        });
    })
    .catch((err) => {
        return err;
    });
}

async function saveToken(id, token) {
    return new Promise((aceito, rejeitado) => {
        db.query('SELECT user_id from tokens where user_id=?', [id], (error, results) => {
            if (error) { rejeitado(error); return; }
            if (results[0]) {
                db.query('UPDATE tokens SET token=? WHERE user_id=?', [token, id], (error, result) => {
                    if (error) { rejeitado(error); return; }
                    aceito(true);
                });
        
            } else {
                db.query('INSERT INTO tokens (user_id, token) values (?, ?)', [id, token], (error, result) => {
                    if (error) { rejeitado(error); return; }
                    aceito(true);
                });
        
            }
        });
    });
}

function generateToken(id) {
    return jwt.sign({ userId: id }, process.env.SECRET, { expiresIn: 1200 }, { algorithm: 'RS256' });
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

async function getUserIdByToken(token) {
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

module.exports = {
    getToken: async(id, email, password) => {
        return getToken(id, email, password);
    },

    deleteToken: async(id) => {
        return new Promise((aceito, rejeitado) => {
            db.query('DELETE FROM phoenix_beta_002.tokens WHERE user_id=?', [id], (error, result) => {
                if(error) { rejeitado(false); return; }
                if (result) { aceito(true); }
                else { rejeitado(false); }
            });
        })
    },

    signUp: async(name, mode, email, password) => {
        return new Promise((aceito, rejeitado) => {
            db.query('INSERT INTO phoenix_beta_002.persons (name, mode, email, password) values (?, ?, ?, ?)', [name, mode, email, password], (error, results) => {
                if(error) { rejeitado(error.code); return; }
                aceito(results);
            });
        })
        .catch(err => {
            return err;
        });
    },

    getCurrentTokenDB: async(token) => {
        return await getCurrentTokenDB(token);
        //return getCurrentTokenDB(token);
    },

    getEmailPasswordById: async(id) => {
        return getEmailPasswordById(id);
    },

    getUserIdByEmail: async(email) => {
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
    },

    getUserIdByToken: async(token) => {
        return getUserIdByToken(token);
    },

    calculateHashAsync: async(plaintext) => {
        const hashStream = crypto.createHash('sha256');
    
        // Alimenta o stream com a mensagem
        hashStream.update(plaintext);
        
        // Finaliza o cálculo do hash 
        const hash = hashStream.digest('hex');

        return hash;
    },

    generateToken: (id) => {
        generateToken(id);
    },

    verifyJWT: async(req, res, next) => {
        var token = req.headers['authorization'];

        if (token != '') {
            jwt.verify(token, process.env.SECRET, async (err, decoded) => {
                if(err) { 
                    let id = await getUserIdByToken(token);

                    if (id) { 
                        let user_login = await getEmailPasswordById(id[0].user_id);
                        if (user_login) {
                            token = await getToken(id[0].user_id, user_login[0].email, user_login[0].password);
                            if (token) {
                                next();
                            } else {
                                res.status(401).json({ msg: 'server internal error' });
                            }
                        } else {
                            res.status(401).json({ msg: 'non-existent user' });
                        }
                    } else {
                        res.status(401).json({ msg: 'invalid authentication'});
                    }
                } 
                if (decoded) {
                    let isCurrentTokenDB = await getCurrentTokenDB(token);

                    if (isCurrentTokenDB) {
                        next();
                    } else {
                        res.status(401).json({ msg: 'other active session'});
                    }
                }
            })
        } else {
            res.status(401).end();
        }
    },

}