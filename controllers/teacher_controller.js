var db = require('../helpers/db_helpers');
var authController = require('./auth_controller.js');

module.exports.controller = (app) => {

    // Login de usuário
    app.post('/api/teacher', async (req, res) => {
        let json;

        let { token } = req.body;
        
        if (token) {
            let userId = await getUserId(token);

            if (userId[0]) {
                db.query('SELECT * FROM persons WHERE id=?', [userId[0].user_id], (error, result_user) => {
                    if (error) { rejeitado(error.code); return; }
                    if (result_user[0]) {
                        let dataAtual = new Date();
                        let ano = dataAtual.getFullYear();
                        let mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
                        let dia = String(dataAtual.getDate()).padStart(2, '0');

                        let dateF = `${ano}/${mes}/${dia}`;

                        db.query('select loc, init, room_id from connection where user_id = ? and day > ? order by day asc, init asc limit 1', [userId[0].user_id, dateF], (error, result_room) => {
                            if (error) { rejeitado(error.code); return; }
                            if (result_room[0]) {
                                json = {
                                    auth: 'true',
                                    name: result_user[0].name,
                                    avatar: result_user[0].avatar,
                                    mode: result_user[0].mode,
                                    next_class: {
                                        init: result_room[0].init,
                                        local: result_room[0].loc,
                                        class: result_room[0].room_id
                                    },
                                    rooms: []
                                };
                            } else {
                                json = {
                                    auth: 'true',
                                    name: result_user[0].name,
                                    avatar: result_user[0].avatar,
                                    mode: result_user[0].mode,
                                    next_class: {
                                        init: "A definir",
                                        local: "A definir",
                                        class: "A definir"
                                    },
                                    rooms: []
                                };
                            }

                            db.query('select distinct rooms.id, rooms.course, rooms.mode from rooms inner join connection on rooms.id = connection.room_id and connection.user_id = ?', [userId[0].user_id], (error, result_rooms) => {
                                if (error) { rejeitado(error.code); return; }
                                for (let i=0; i < result_rooms.length; i++) {
                                    json.rooms.push({
                                        id: result_rooms[i].id,
                                        mode: (result_rooms[i].mode=="E"),
                                        course: result_rooms[i].course
                                    });
                                }
                                res.status(200).json(json);
                            })
                        });
                    } else {
                        res.status(401).json({ msg: 'Usuáro não encontrado' });
                    }
                })
            } else {
                res.status(401).json({ msg: 'Token invalido!' });
            }

        } else {
            res.status(400).json({ msg: 'Inclua os dados corretamente!' });
        }
    });

    app.post('/api/teacher/context', async (req, res) => {
        let json;

        let { token } = req.body;
        
        if (token) {
            let userId = await getUserId(token);

            if (userId[0]) {
                let dataAtual = new Date();
                let ano = dataAtual.getFullYear();
                let mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
                let dia = String(dataAtual.getDate()).padStart(2, '0');

                let dateF = `${ano}/${mes}/${dia}`;

                let data = new Date(); // Obtém o momento atual
                let horas = data.getHours();
                let minutos = data.getMinutes();
                let hhmm = `${horas < 10 ? '0' + horas : horas}:${minutos < 10 ? '0' + minutos : minutos}`;

                db.query('SELECT name FROM persons WHERE id=?', [userId[0].user_id], (error, result_user) => {
                    if (error) { rejeitado(error.code); return; }
                    if (result_user[0]) {
                        json = {
                            auth: true,
                            name: result_user[0].name,
                            time: hhmm,
                            date: dateF,
                            rooms: []
                        }

                        db.query('select distinct rooms.id, rooms.course, rooms.mode from rooms inner join connection on rooms.id = connection.room_id and connection.user_id = ?', [userId[0].user_id], (error, result_rooms) => {
                            if (error) { rejeitado(error.code); return; }
                            for (let i=0; i < result_rooms.length; i++) {
                                let data = {
                                    id: result_rooms[i].id,
                                    course: result_rooms[i].course,
                                    type: ((result_rooms[i].mode == "E") ? "Ensino médio" : "Curso Técnico"),
                                    days: []
                                }
                                db.query('select day, init, end, loc from connection where room_id = ? and user_id = ?', [result_rooms[i].id, userId[0].user_id], (error, result_rmData) => {
                                    if (error) { rejeitado(error.code); return; }
                                    for (let c=0; c < result_rmData.length; c++) {
                                        data.days.push({
                                            day: result_rmData[c].day,
                                            init: result_rmData[c].init,
                                            end: result_rmData[c].end,
                                            local: result_rmData[c].loc
                                        });
                                        
                                    }
                                    json.rooms.push(data);
                                    if (i == result_rooms.length-1) {
                                        console.log(json);
                                        res.status(200).json(json);
                                    }
                                });
                            }
                            
                        })
                    }
                });
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
        db.query('SELECT user_id FROM tokens WHERE token=?', [token], (error, result) => {
            if (error) { rejeitado(error.code); return; }
            aceito(result);
        })
    })
    .catch(err => {
        return err;
    });
}
