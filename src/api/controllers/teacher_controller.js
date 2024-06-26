var db = require('../../config/dbconn');
const serverServices = require('../services/serverServices.js');
const middleware = require('../middlewares/middlewares.js');

const fs = require('fs');

function fileVerify(path) {
  try {
    fs.accessSync(path, fs.constants.F_OK);
    return true; // O arquivo existe
  } catch (err) {
    return false; // O arquivo não existe
  }
}

function saveHistory(userId, history) {
    let file = "./convs/" + String(userId[0].user_id) + ".json";
    fs.writeFile(file, JSON.stringify(history), 'utf8', (erro) => {
        if (erro) {
            console.error(erro);
            return;
        }
    });
}

function loadHistory(path) {
    try {
        const data = fs.readFileSync(path, 'utf8');
        const history = JSON.parse(data);
        return history;
    } catch (err) {
        console.error('Erro ao ler o arquivo:', err);
        throw err;  // Rejeite a promise se houver um erro
    }
}

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const { text } = require('express');
  
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: 'Seu nome é Ignis, e você é uma IA do site Phoenix, seus pronomes são ela/dela, que visa ajudar os professores nas consultas de horários das aulas, turmas que ele administra e solução de dúvidas, evite usar emojis nas conversas, a primeira mensagem enviada é um json som algumas informações retiradas do banco de dados e informações de data e hora atuais, por exemplo, o "name" é o nome do professor, "time" é a hora, minuto e sundos atuais, use de base nas suas conversas, se te pedir as próximas aulas, entregue aulas após a data do "date", mas se tiver uma aula nesse mesmo dia retorne aulas após o horário do "time", fique atenta ao argumento "first_message", pois ele é a primeira mensagem que o usuário envia, pode ser que nela o usuário faça uma pergunta com base nos dados fornecidos no json ou uma pergunta fora do escopo de "Bom dia", "Boa tarde", "Boa noite" \nExemplo de conversa:\n\nuser:{"name": "Marcelo de Almeida Leal", "time": "21:48", "date": "2024/06/22", "first_message": "Boa noite Ignis", "rooms": [{"id": 81471,"course": "Técnico em Biotecnologia", "type": "Ensino médio", "days": [{"day": "2024-03-25T03:00:00.000Z", "init": "13:00:00", "end": "15:30:00", "local": "CIMATEC 2 | 3°ANDAR | SALA 2.3.03"}, {"day": "2024-04-01T03:00:00.000Z", "init": "13:00:00", "end": "15:30:00", "local": "CIMATEC 2 | 3°ANDAR | SALA 2.3.03"}, {"day": "2024-04-08T03:00:00.000Z", "init": "13:00:00", "end": "15:30:00", "local": "CIMATEC 2 | 3°ANDAR | SALA 2.3.03"}, {"day": "2024-04-15T03:00:00.000Z", "init": "13:00:00", "end": "15:30:00", "local": "CIMATEC 2 | 3°ANDAR | SALA 2.3.03"}, {"day": "2024-04-22T03:00:00.000Z", "init": "13:00:00", "end": "15:30:00", "local": "CIMATEC 2 | 3°ANDAR | SALA 2.3.03"}, {"day": "2024-04-29T03:00:00.000Z", "init": "13:00:00", "end": "15:30:00", "local": "CIMATEC 2 | 3°ANDAR | SALA 2.3.03"}, {"day": "2024-05-06T03:00:00.000Z", "init": "13:00:00", "end": "15:30:00", "local": "CIMATEC 2 | 3°ANDAR | SALA 2.3.03"}, {"day": "2024-05-13T03:00:00.000Z", "init": "13:00:00", "end": "15:30:00", "local": "CIMATEC 2 | 3°ANDAR | SALA 2.3.03"}]}, {"id": 81472,"course": "Técnico em Biotecnologia", "type": "Ensino médio", "days": [{"day": "2024-04-22T03:00:00.000Z", "init": "15:49:59", "end": "18:20:00", "local": "CIMATEC 2 | 3°ANDAR | SALA 2.3.05"}, {"day": "2024-05-06T03:00:00.000Z", "init": "15:49:59", "end": "18:20:00", "local": "CIMATEC 2 | 3°ANDAR | SALA 2.3.05"}, {"day": "2024-05-13T03:00:00.000Z", "init": "15:49:59", "end": "18:20:00", "local": "CIMATEC 2 | 3°ANDAR | SALA 2.3.05"}, {"day": "2024-05-20T03:00:00.000Z", "init": "15:49:59", "end": "18:20:00", "local": "CIMATEC 2 | 3°ANDAR | SALA 2.3.05"}, {"day": "2024-05-27T03:00:00.000Z", "init": "15:49:59", "end": "18:20:00", "local": "CIMATEC 2 | 3°ANDAR | SALA 2.3.05"}, {"day": "2024-06-03T03:00:00.000Z", "init": "15:49:59", "end": "18:20:00", "local": "CIMATEC 2 | 3°ANDAR | SALA 2.3.05"}, {"day": "2024-06-10T03:00:00.000Z", "init": "15:49:59", "end": "18:20:00", "local": "CIMATEC 2 | 3°ANDAR | SALA 2.3.05"}, {"day": "2024-06-17T03:00:00.000Z", "init": "15:49:59", "end": "18:20:00", "local": "CIMATEC 2 | 3°ANDAR | SALA 2.3.05"}]}, {"id": 88143,"course": "Técnico em Redes de Computadores", "type": "Curso Técnico", "days": [{"day": "2024-05-10T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 101 - CIMATEC - SESI - 1º ANDAR - 101"}, {"day": "2024-05-17T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 101 - CIMATEC - SESI - 1º ANDAR - 101"}, {"day": "2024-05-24T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 101 - CIMATEC - SESI - 1º ANDAR - 101"}, {"day": "2024-06-07T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 101 - CIMATEC - SESI - 1º ANDAR - 101"}, {"day": "2024-06-14T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 101 - CIMATEC - SESI - 1º ANDAR - 101"}, {"day": "2024-06-28T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 101 - CIMATEC - SESI - 1º ANDAR - 101"}, {"day": "2024-03-22T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 101 - CIMATEC - SESI - 1º ANDAR - 101"}, {"day": "2024-04-05T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 101 - CIMATEC - SESI - 1º ANDAR - 101"}, {"day": "2024-04-12T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 101 - CIMATEC - SESI - 1º ANDAR - 101"}, {"day": "2024-04-19T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 101 - CIMATEC - SESI - 1º ANDAR - 101"}, {"day": "2024-04-26T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 101 - CIMATEC - SESI - 1º ANDAR - 101"}, {"day": "2024-05-03T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 101 - CIMATEC - SESI - 1º ANDAR - 101"}]}, {"id": 88147,"course": "Técnico em Edificações", "type": "Curso Técnico", "days": [{"day": "2024-05-22T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 114 - CIMATEC - SESI - 1º ANDAR - 114"}, {"day": "2024-05-29T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 114 - CIMATEC - SESI - 1º ANDAR - 114"}, {"day": "2024-06-05T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 114 - CIMATEC - SESI - 1º ANDAR - 114"}, {"day": "2024-06-12T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 114 - CIMATEC - SESI - 1º ANDAR - 114"}, {"day": "2024-06-19T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 114 - CIMATEC - SESI - 1º ANDAR - 114"}, {"day": "2024-06-26T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 114 - CIMATEC - SESI - 1º ANDAR - 114"}]}, {"id": 91122,"course": "Técnico em Manutenção Automotiva", "type": "Curso Técnico", "days": [{"day": "2024-04-03T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 210 - CIMATEC - SESI - 2º ANDAR - 210"}, {"day": "2024-04-10T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 210 - CIMATEC - SESI - 2º ANDAR - 210"}, {"day": "2024-04-17T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 210 - CIMATEC - SESI - 2º ANDAR - 210"}, {"day": "2024-04-24T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 210 - CIMATEC - SESI - 2º ANDAR - 210"}, {"day": "2024-05-08T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 210 - CIMATEC - SESI - 2º ANDAR - 210"}, {"day": "2024-05-15T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 210 - CIMATEC - SESI - 2º ANDAR - 210"}]}, {"id": 91124,"course": "Técnico em Mecânica", "type": "Curso Técnico", "days": [{"day": "2024-06-17T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 211 - CIMATEC - SESI - 2º ANDAR - 211"}, {"day": "2024-06-18T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 211 - CIMATEC - SESI - 2º ANDAR - 211"}, {"day": "2024-06-06T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 211 - CIMATEC - SESI - 2º ANDAR - 211"}, {"day": "2024-06-13T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 211 - CIMATEC - SESI - 2º ANDAR - 211"}, {"day": "2024-06-20T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 211 - CIMATEC - SESI - 2º ANDAR - 211"}, {"day": "2024-06-27T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 211 - CIMATEC - SESI - 2º ANDAR - 211"}]}, {"id": 91125,"course": "Técnico em Mecatrônica", "type": "Curso Técnico", "days": [{"day": "2024-04-04T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 212 - CIMATEC - SESI - 2º ANDAR - 212"}, {"day": "2024-04-11T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 212 - CIMATEC - SESI - 2º ANDAR - 212"}, {"day": "2024-04-18T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 212 - CIMATEC - SESI - 2º ANDAR - 212"}, {"day": "2024-04-25T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 212 - CIMATEC - SESI - 2º ANDAR - 212"}, {"day": "2024-05-02T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 212 - CIMATEC - SESI - 2º ANDAR - 212"}, {"day": "2024-05-09T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "SES 212 - CIMATEC - SESI - 2º ANDAR - 212"}]}, {"id": 91127,"course": "Técnico em Petroquímica", "type": "Curso Técnico", "days": [{"day": "2024-04-23T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "CIMATEC 5 | 4°ANDAR | SALA 5.4.02 30/60"}, {"day": "2024-04-30T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "CIMATEC 5 | 4°ANDAR | SALA 5.4.02 30/60"}, {"day": "2024-05-07T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "CIMATEC 5 | 4°ANDAR | SALA 5.4.02 30/60"}, {"day": "2024-05-14T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "CIMATEC 5 | 4°ANDAR | SALA 5.4.02 30/60"}, {"day": "2024-05-21T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "CIMATEC 5 | 4°ANDAR | SALA 5.4.02 30/60"}, {"day": "2024-05-28T03:00:00.000Z", "init": "18:40:00", "end": "21:40:00", "local": "CIMATEC 5 | 4°ANDAR | SALA 5.4.02 30/60"}]}]\n}"}\nmodel: Boa noite Marcelo! Como posso ajudar você hoje? Sou Ignis, estou aqui para auxiliar o senhor com consultas de horários, turmas e dúvidas.\nuser: Quero saber quais as turmas que eu dou aula\nmodel: Com base nas informações que eu tenho, você leciona as seguintes turmas: \n\n* Técnico em Biotecnologia (Ensino médio) [81471, 81472] - duas turmas com horários diferentes \n* Técnico em Redes de Computadores (Curso Técnico) [88143]\n* Técnico em Edificações (Curso Técnico)  [88147]\n* Técnico em Manutenção Automotiva (Curso Técnico) [91122]\n* Técnico em Mecânica (Curso Técnico) [91124]\n* Técnico em Mecatrônica (Curso Técnico) [91125]\n* Técnico em Petroquímica (Curso Técnico) [91127]\n\nPrecisa de mais alguma informação sobre essas turmas, como os dias e horários das aulas ou a localização das salas?\nuser: Qual a aula mais próxima?\model: A aula mais próxima é a de **Técnico em Redes de Computadores**, no dia **28/06/2024**, das **18:40** às **18:20**, na sala **SES 101 - CIMATEC - SESI - 1º ANDAR - 101**. \n\nPrecisa de mais alguma informação sobre essa aula, ou sobre alguma outra?\nuser: Ignis, certo? é esse o seu nome né? você pode me informar quais os dias que tenho aula com essa turma?\nmodel: Sim, meu nome é Ignis. E você tem aula de Técnico em Redes de Computadores nas seguintes datas:\n\n* 22/03/2024\n* 05/04/2024\n* 12/04/2024\n* 19/04/2024\n* 26/04/2024\n* 03/05/2024\n* 10/05/2024\n* 17/05/2024\n* 24/05/2024\n* 07/06/2024\n* 14/06/2024\n* 28/06/2024\n\nTodas as aulas acontecem das 18:40 às 21:40, na sala SES 101 - CIMATEC - SESI - 1º ANDAR - 101. \n\nEspero ter ajudado!\nuser: Você pode me informar sobre a turma 81474?\nmodel: Verificando a base de dados...  A turma com o código 81474, as informações dessa sala não estão disponíveis para o senhor. Você deseja verificar outro código de turma? Ou talvez tenha se enganado com o número?\nuser: Quais os registro que eu tenho disponível?\nmodel: Você tem disponível as salas de registro: 81471, 81472, 88143, 88147, 91122, 91124, 91125, 91127.',
});
  
const generationConfig = {
temperature: 0.7,
topP: 0.95,
topK: 64,
maxOutputTokens: 8192,
responseMimeType: "text/plain",
};

async function run(input, history) {
const chatSession = model.startChat({
    generationConfig,
    history: history,
});

await chatSession.sendMessage(input);
return chatSession.params.history;
};

module.exports.controller = (app) => {

    app.get('/api/teacher', middleware.verifyJWT, async (req, res) => {
        let json;

        var token = req.headers['authorization'];
        
        let userId = await serverServices.getUserIdByToken(token);

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
                                name: result_user[0].name,
                                email: result_user[0].email,
                                avatar: result_user[0].avatar,
                                mode: result_user[0].mode,
                                next_class: {
                                    init: result_room[0].init,
                                    local: result_room[0].loc,
                                    class: result_room[0].room_id
                                },
                                rooms: [],
                            };
                        } else {
                            json = {
                                name: result_user[0].name,
                                email: result_user[0].email,
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
                    res.status(401).end();
                }
            })
        } else {
            res.status(401).end();
        }

        
    });

    app.post('/api/teacher/chat', middleware.verifyJWT, async (req, res) => {
        let token= req.headers['authorization'];

        let { type, input } = req.body;
    
        let userId = await serverServices.getUserIdByToken(token);

        let history;

        if (type && input) {
            if (userId[0]) {
                let path = "./convs/" + String(userId[0].user_id) + ".json";
                if (fileVerify(path) && type == "continue") {
                    history = await refreshTime(loadHistory(path));

                } else {
                    input = await getContext(userId, input);
                    history = [];
                }

                let histo = await run(JSON.stringify(input), history);

                saveHistory(userId, histo);

                res.status(200).json(histo[histo.length-1].parts[0].text);
            } else {
                res.status(401).end();
            }
        } else {
            res.status(400).end();
        }
        
    });

    app.get('/api/teacher/refresh', middleware.verifyJWT, async (req, res) => {
        var token = req.headers['authorization'];
        
        let userId = await serverServices.getUserIdByToken(token);

        if (userId[0]) {
            let json = await refreshTime(loadHistory("./convs/" + String(userId[0].user_id) + ".json"))
            res.status(200).json(json);
        } else {
            res.status(400).end();
        }
    });
}

async function getContext(userId, input) {
    return new Promise((aceito, rejeitado) => {
        let dataAtual = new Date();
        let ano = dataAtual.getFullYear();
        let mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        let dia = String(dataAtual.getDate()).padStart(2, '0');

        let dateF = `${ano}/${mes}/${dia}`;

        let data = new Date(); // Obtém o momento atual
        let horas = data.getHours()-3;
        let minutos = data.getMinutes();
        let hhmm = `${horas < 10 ? '0' + horas : horas}:${minutos < 10 ? '0' + minutos : minutos}`;

        let json = {
            name: '',
            time: hhmm,
            date: dateF,
            first_message: input,
            rooms: []
        };

        db.query('SELECT name FROM persons WHERE id=?', [userId[0].user_id], (error, result_user) => {
            if (error) { 
                rejeitado(error.code); 
            }
            if (result_user[0]) {
                json.name = result_user[0].name;

                db.query('select distinct rooms.id, rooms.course, rooms.mode from rooms inner join connection on rooms.id = connection.room_id and connection.user_id = ?', [userId[0].user_id], (error, result_rooms) => {
                    if (error) { 
                        rejeitado(error.code);
                    }
                    let promises = [];

                    for (let i = 0; i < result_rooms.length; i++) {
                        let data = {
                            id: result_rooms[i].id,
                            course: result_rooms[i].course,
                            type: ((result_rooms[i].mode == "E") ? "Ensino médio" : "Curso Técnico"),
                            days: []
                        };

                        // Utilizando uma função auxiliar para encapsular a lógica assíncrona de obter os dados do quarto
                        promises.push(getRoomData(data, userId[0].user_id));
                    }

                    // Espera por todas as promises serem resolvidas
                    Promise.all(promises)
                        .then((roomsData) => {
                            json.rooms = roomsData;
                            aceito(json);
                        })
                        .catch((error) => {
                            rejeitado(error);
                        }
                    );
                });
            }
        });
    });
}

async function getRoomData(data, userId) {
    return new Promise((resolve, reject) => {
        db.query('select day, init, end, loc from connection where room_id = ? and user_id = ?', [data.id, userId], (error, result_rmData) => {
            if (error) { 
                reject(error.code); 
            }
            for (let c = 0; c < result_rmData.length; c++) {
                data.days.push({
                    day: result_rmData[c].day,
                    init: result_rmData[c].init,
                    end: result_rmData[c].end,
                    local: result_rmData[c].loc
                });
            }
            resolve(data);
        });
    });
}

async function refreshTime(history) {
    return new Promise((resolve, reject) => {
        let dataAtual = new Date();
        let ano = dataAtual.getFullYear();
        let mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        let dia = String(dataAtual.getDate()).padStart(2, '0');

        let dateF = `${ano}/${mes}/${dia}`;

        let data = new Date(); // Obtém o momento atual
        let horas = data.getHours()-3;
        let minutos = data.getMinutes();

        let hhmm = `${horas < 10 ? '0' + horas : horas}:${minutos < 10 ? '0' + minutos : minutos}`;

        let context = JSON.parse(history[0].parts[0].text);

        context.date = dateF;
        context.time = hhmm;

        let contextStr = JSON.stringify(context);

        history[0].parts[0].text = contextStr;

        resolve(history);
    });
}
