const crypto = require('crypto');
const jwt = require('jsonwebtoken');
var db = require('../../config/dbconn');

async function getToken(id, email, password) {
    return new Promise((aceito, rejeitado) => {
        db.query('SELECT password FROM phoenix_beta_002.persons WHERE email=?', [email, password] , async (error, results) => {
            if (error) { rejeitado(error); return; }
            if (results) {
                if (password != results[0].password) {
                    rejeitado(false);
                } else {  
                    let token = generateToken(id, email); // Cria o token
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

function generateToken(id, email) {
    return jwt.sign({ userId: id, email: email  }, process.env.SECRET, { expiresIn: 1200 }, { algorithm: 'RS256' });
}

async function getCurrentTokenDB(token) {
    return new Promise((aceito, rejeitado) => {
        db.query('SELECT token FROM tokens WHERE token=?', [token], async (error, result) => {
            if (error) { rejeitado(error.code); return; }
            if (result.length > 0) {
                aceito(result);
            } else {
                rejeitado(false);
            }
        });
    })
    .catch((err) => {
        return err;
    });
}

async function getTokenById(id) {
    return new Promise((aceito, rejeitado) => {
        db.query('SELECT token FROM tokens WHERE user_id=?', [id], async (error, result) =>{
            if (error) { rejeitado(error.code); return; }
            if (result.length > 0) { aceito(true); }
            else { rejeitado(false); }
        });
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

    saveToken: async(id, token) =>{
        return saveToken(id, token);
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
        return getCurrentTokenDB(token);
    },

    getTokenById: async(id) => {
        return getTokenById(id);
    },

    getEmailPasswordById: async(id) => {
        return getEmailPasswordById(id);
    },

    getUserIdByEmail: async(email) => {
        return new Promise((aceito, rejeitado) => {
            db.query('SELECT id, name FROM phoenix_beta_002.persons WHERE email=?', [email], (error, result) => {
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

    deleteUser: async(id) => {
        return new Promise((aceito, rejeitado) => {
            db.query('DELETE FROM phoenix_beta_002.persons WHERE id=?' [id], (error, result) => {
                if (error) { rejeitado(error.code); return; }
                if (result) { aceito(true); }
                else { rejeitado(false); }
            })
        })
    },

    calculateHashAsync: async(plaintext, salt) => {
        plaintext += salt;
        const hashStream = crypto.createHash('sha256');
    
        // Alimenta o stream com a mensagem
        hashStream.update(plaintext);
        
        // Finaliza o cálculo do hash 
        const hash = hashStream.digest('hex');

        return hash;
    },

    generateToken: async (id, email) => {
        return generateToken(id, email);
    },
}