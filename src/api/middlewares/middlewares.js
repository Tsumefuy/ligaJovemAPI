const jwt = require('jsonwebtoken');
const serverServices = require('../services/serverServices');

module.exports = {
    verifyJWT: async(req, res, next) => {
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
                                next();
                            } else {
                                res.status(500).end();
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
                        next();
                    } else {
                        let otherToken = await serverServices.getTokenById(decoded.userId);
                        if (otherToken) {
                            res.status(401).json({ msg: 'other active session'});
                        } else {
                            res.status(401).end();
                        }
                    }
                }
            })
        } else {
            res.status(401).end();
        }
    },

    verifyADMJWT: async(req, res, next) => {
        var token = req.headers['authorization'];

        if (token != '') {
            jwt.verify(token, process.env.ADMSECRET, async (err, decoded) => {
                if(err) { 
                    let id = await serverServices.getUserIdByToken(token);

                    if (id) { 
                        let user_login = await serverServices.getEmailPasswordById(id[0].user_id);
                        if (user_login) {
                            token = await serverServices.getToken(id[0].user_id, user_login[0].email, user_login[0].password);
                            if (token) {
                                next();
                            } else {
                                res.status(500).end();
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
                        next();
                    } else {
                        let otherToken = await serverServices.getTokenById(decoded.userId);
                        if (otherToken) {
                            res.status(401).json({ msg: 'other active session'});
                        } else {
                            res.status(401).end();
                        }
                    }
                }
            })
        } else {
            res.status(401).end();
        }
    },
}