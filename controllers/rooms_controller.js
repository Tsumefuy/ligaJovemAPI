var db = require('../helpers/db_helpers');
var helper = require('../helpers/helpers');
var authController = require('./auth_controller.js');

module.exports.controller = (app) => {

    app.get('/api/rooms', authController.verifyJWT, async (req,res) => {
        let rooms = await getAllRooms();
        res.json(rooms);
    })

    app.get('/api/rooms/:id', authController.verifyJWT, async (req, res) => {
        let room = await getRoom(req.params.id);  
        if (room) {
            res.json(room);s
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