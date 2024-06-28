require('dotenv').config({path:'.env'});
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const https = require('https');
const http = require('http');
const compression = require('compression');
const cors = require('cors');
var  fs = require('fs');

var indexRouter = require('./api/routes/index');
var usersRouter = require('./api/routes/users');

const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/phoenixapi.criarsite.online/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/phoenixapi.criarsite.online/fullchain.pem')
};

// Porta HTTP (apenas para redirecionamento se necessário)
const httpPort = 3000;

// Porta HTTPS
const httpsPort = 443;

const app = express();

app.use(compression());
app.use(logger('dev'));
app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const corsOptions = {
  origin: "*",
  //origin: "https://phoenixligajovem.netlify.app",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
  //'Access-Control-Allow-Origin': 'https://phoenixligajovem.netlify.app'
}

app.use(cors(corsOptions));

fs.readdirSync('./src/api/controllers').forEach((file) => {
  if(file.substr(-3) == ".js") {
    route = require('./api/controllers/' + file);
    route.controller(app);
  }
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json('error');
});

module.exports = app;

// Servidor HTTPS
https.createServer(sslOptions, app).listen(httpsPort, () => {
  console.log(`Servidor HTTPS rodando na porta ${httpsPort}!`);
});

// Servidor HTTP para redirecionamento (opcional)
http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(httpPort, () => {
  console.log(`Servidor HTTP rodando na porta ${httpPort}!`);
});

Array.prototype.swap = (x,y) => {
  var b = this[x];
  this[x] = this[y];
  this[y] =  b;
  return this;
}

Array.prototype.insert = (index, item) => {
  this.splice(index,0,item);
}

Array.prototype.replace_null = (replace = '""') => {
  return JSON.parse(JSON.stringify(this).replace(/mull/g, replace));
}

String.prototype.replaceAll = (search, replacement) => {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
}
