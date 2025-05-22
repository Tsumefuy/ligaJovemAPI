var db = require('../../config/dbconn');
const serverServices = require('../services/serverServices.js');
const middleware = require('../middlewares/middlewares.js');

module.exports.controller = (app) => {

    app.get('/api/rooms', middleware.verifyJWT, async (req,res) => {
        let rooms = await getAllRooms();
        res.json(rooms);
    })

    app.get('/api/rooms/:id', middleware.verifyJWT, async (req, res) => {
        let room = await getRoom(req.params.id);  
        if (room) {
            res.json(room);
        } else {
            res.status(400).json({ msg: 'Essa turma não existe!' })
        }
    })

}

async function getAllRooms() {
    return new Promise((aceito, rejeitado)=>{
        db.query('SELECT id, course, mode from phoenix_production.rooms', (error, results)=>{
            if(error) {rejeitado(error); return; }
            aceito(results);
        })
    })
}

async function getRoom(id) {
    return new Promise((aceito, rejeitado)=>{
        db.query('SELECT id, course, mode FROM phoenix_production.rooms WHERE id=?', [id], (error, results)=>{
            if(error) {rejeitado(error); return; }
            aceito(results);
        })
    })
}