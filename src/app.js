require('dotenv').config({path:'.env'});
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const https = require('https');
const compression = require('compression');
const cors = require('cors');
var  fs = require('fs');

var indexRouter = require('./api/routes/index');
var usersRouter = require('./api/routes/users');

const app = express();

const options = {
  key: fs.readFileSync('selfsigned.key'),
  cert: fs.readFileSync('selfsigned.crt')
};

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

https.createServer(options, app).listen(443, () => {
  console.log('Servidor HTTPS rodando na porta 443!');
});

const http = require('http');
http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(80);

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
