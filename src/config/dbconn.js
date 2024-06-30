const mySql = require('mysql2');
const fs = require("fs");

const connection = mySql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: {
        ca: fs.readFileSync('./src/ssl/server-ca.pem'),
        cert: fs.readFileSync('./src/ssl/client-cert.pem'),
        key: fs.readFileSync('./src/ssl/client-key.pem')
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