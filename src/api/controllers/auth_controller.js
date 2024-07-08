const middleware = require('../middlewares/middlewares.js');
const serverServices = require('../services/serverServices.js');
const jwt = require('jsonwebtoken');

module.exports.controller = (app) => {

    // Resgitro de usuário
    app.post('/api/register', async (req, res) => {
        let json;

        let { name, mode, email, password } = req.body;

        if (name && mode && email && password) {
            let hash = await serverServices.calculateHashAsync(password, name);

            let response = await serverServices.signUp(name, mode, email, hash);

            if(response=="ER_DUP_ENTRY"){
                res.status(401).json({ msg: 'Email já utilizado!' });
            }else{  
                let userId = await serverServices.getUserIdByEmail(email);
                let token = await serverServices.generateToken(userId[0].id, email); // Cria o token
                let saved = await serverServices.saveToken(userId[0].id, token);
                if (saved) {
                    json = {    
                        token: token
                    };
                    res.status(201).json(json);
                } else {
                    serverServices.deleteUser(userId[0].id);
                    res.status(500).end();
                }
            }
        } else {
            res.status(400).end();
        }
    });

    // Login de usuário
    app.post('/api/login', async (req, res) => {
        let json;
        let token;
        
        let email = req.body.email;

        if (email && req.body.password) {
            let user = await serverServices.getUserIdByEmail(email); 

            if (user[0]) { // Se o usuário existir
                if (req.body.password == '123456') { // Tirar depois (gambiarra kkkk)
                    token = await serverServices.getToken(user[0].id, email, await serverServices.calculateHashAsync(req.body.password, ''));
                } else {
                    token = await serverServices.getToken(user[0].id, email, await serverServices.calculateHashAsync(req.body.password, user[0].name));
                }
                if (token) {
                    json = {
                        token: token
                    };
                    res.json(json);
                } else {
                    res.status(401).end();
                }
            } else {
                res.status(401).end();
            }
        } else {
            res.status(400).end();
        }
    });

    // Verifica Token
    app.put('/api/login', async (req, res) => {
        let token = req.headers['authorization'];

        if (token != '') {
            jwt.verify(token, process.env.SECRET, async (err, decoded) => {
                if(err) { 
                    
                    let id = await serverServices.getUserIdByToken(token);

                    if (id[0]) { 
                        let user_login = await serverServices.getEmailPasswordById(id[0].user_id);
                        if (user_login) {
                            token = await serverServices.getToken(id[0].user_id, user_login[0].email, user_login[0].password);
                            if (token) {
                                res.json({
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
                    let isCurrentTokenDB = await serverServices.getCurrentTokenDB(token);
                    if (isCurrentTokenDB) {
                        res.json({
                            token: token
                        });
                    } else {
                        res.status(401).end();
                    }
                }
            })
        } else {
            res.status(401).end();
        }
    });

    // Logout
    app.delete('/api/logout', middleware.verifyJWT, async(req, res) => {
        let token = req.headers['authorization'];

        let id = await serverServices.getUserIdByToken(token);
        
        if (id[0]) {
            let deleted = await serverServices.deleteToken(id[0].user_id);

            if (deleted) {
                res.status(200).end();
            } else {
                res.status(401).end();
            }
        } else {
            res.status(401).end();
        }
    });
}