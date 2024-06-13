var db = require('../helpers/db_helpers');
var helper = require('../helpers/helpers');
var multiparty = require('multiparty');

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

}

async function getAllRooms() {
    return new Promise((aceito, rejeitado)=>{
        db.query('SELECT id, course, mode from phoenix_production.rooms', (error, results)=>{
            if(error) {rejeitado(error); return; }
            aceito(results);
        })
    })
}