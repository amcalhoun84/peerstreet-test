const express = require('express'),
  fs = require('fs'),
  http = require('http'),
  path = require('path'),
  cors = require('cors'),
  app = express(),
  port = process.env.PORT || 5000,
  bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extends: true }));
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.setHeader('Cache-Control', 'no-cache');
  next();
});


const route = require('./api/route');
route(app);

app.listen(port, function () {
  console.log(`Portal opened on port: ${port}`);
});

function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) return val;
  if (port >= 0) return port;
};

function onError(error) {
  if (error.syscall !== 'listen') throw error;
  const bind = typeof port === 'string' ? 'Pipe' + pipe : 'Port' + port;

  switch (error.code) {
    case 'EACCESS':
      console.error(bind + ' requires elevated privvies or an admin account.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' already in use.');
      process.exit(1);
      break;
    default:
      throw error;
      break;
  }
};


function onListening() {

  var addr = server.address();
  var bind = typeof addr === 'string' ? 'Pipe' + addr : 'port' + addr.port;
  debug(`Listening on ${bind}`);
};

module.exports = app;
