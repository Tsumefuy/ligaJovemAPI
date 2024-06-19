var db = require('../helpers/db_helpers');
var helper = require('../helpers/helpers');

module.exports.controller = (app, io, socket_list) => {

    app.get('/api/rooms', async (req,res) => {
        let json = {error:'', result:[]};

        let rooms = await getAllRooms();

        for(let i in rooms){
            json.result.push({
                id: rooms[i].id,
                course: rooms[i].course,
                mode: rooms[i].mode
            });
        };

        res.json(json);
    })

    app.get('/api/rooms/:id', async (req, res) => {

        let stts = 200;

        let room = await getRoom(req.params.id);
        console.log(room);

        for(let i in room) {   
            if (room[0] != null) {
                json.result.push({
                    id: room[i].id,
                    course: room[i].course,
                    mode: room[i].mode
                });
            } else {
                json.error = 'Essa sala não existe!';
                stts = 400;
            }
        };

        res.status(stts).json(json);
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

async function getRoomId(id) {
    return new Promise((aceito, rejeitado)=>{
        db.query('SELECT id FROM phoenix_production.rooms WHERE id=?', [id], (error, results) => {
            if(error) { rejeitado(error); return; }
            aceito(results);
        })
    })
}