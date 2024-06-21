const mySql = require('mysql2');
const fs = require("fs");

const connection = mySql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: {
        ca: fs.readFileSync(__dirname + '/ca.pem'),
        rejectUnauthorized: false
    }
});

connection.connect((error)=>{
    if(error) {
        console.log(error)
        throw error;
    }
    console.log(`Conectado ao Banco de Dados: ${process.env.DB_NAME}`);
});

module.exports = connection;