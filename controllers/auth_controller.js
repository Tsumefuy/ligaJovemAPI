const serverServices = require('../services/serverServices.js');
const jwt = require('jsonwebtoken');

module.exports.controller = (app) => {

    // Resgitro de usuário
    app.post('/api/register', async (req, res) => {
        let json;

        let { name, mode, email, password } = req.body;

        if (name && mode && email && password) {
            let response = await serverServices.signUp(name, mode, email, await serverServices.calculateHashAsync(password));

            if(response=="ER_DUP_ENTRY"){
                res.status(401).json({ msg: 'Email já utilizado!' });
            }else{  
                let userId = await serverServices.getUserIdByEmail(email);
                let token = await serverServices.getToken(userId[0].id, email, await serverServices.calculateHashAsync(password));
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
            let user = await serverServices.getUserIdByEmail(email); 

            if (user) { // Se o usuário existir
                let token = await serverServices.getToken(user[0].id, email, await serverServices.calculateHashAsync(password));
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

    app.put('/api/login', async (req, res) => {
        var token = req.headers['authorization'];

        if (token != '') {
            jwt.verify(token, process.env.SECRET, async (err, decoded) => {
                if(err) { 
                    
                    let id = await serverServices.getUserIdByToken(token);

                    if (id) { 
                        let user_login = await serverServices.getEmailPasswordById(id[0].user_id);
                        if (user_login) {
                            token = await serverServices.getToken(id[0].user_id, user_login[0].email, user_login[0].password);
                            if (token) {
                                res.json({
                                    auth: 'true',
                                    description: 'login successful by new token',
                                    token: token,
                                });
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
                    //let isCurrentTokenDB = await serverServices.getCurrentTokenDB(token);
                    let isCurrentTokenDB = await serverServices.getCurrentTokenDB(token);
                    if (isCurrentTokenDB) {
                        res.json({
                            auth: 'true',
                            description: 'login successful by token',
                            token: token,
                        });
                    } else {
                        res.status(401).json({ msg: 'other active session'});
                    }
                }
            })
        } else {
            res.status(401).end();
        }
    });

}