var https = require('https');
var fs = require('fs');

var express = require('express');
var expressWs = require('express-ws');

var options = {
    cert: fs.readFileSync("/etc/letsencrypt/live/arcade-numeric.bnr.la/fullchain.pem"),
    key: fs.readFileSync("/etc/letsencrypt/live/arcade-numeric.bnr.la/privkey.pem")
};

const broadcasters = new Set();
const receivers = new Set();

var app = express();
var server = https.createServer(options, app);
var expressWs = expressWs(app, server);

app.use(function (req, res, next) {
  console.log('middleware');
  req.testing = 'testing';
  return next();
});

app.get('/', function(req, res, next){
  console.log('get route', req.testing);
  res.end();
});

app.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
  });
  console.log('socket', req.testing);
});

app.ws('/broadcast', function(ws, req){
  broadcasters.add(ws);
  console.log('A new broadcaster connected.');

  ws.on('message', function(message) {
    console.log('Broadcasting: %s', message);
    receivers.forEach(receiver => {
      //if (receiver.readyState === WebSocket.OPEN) {
      receiver.send(message);
      //}
    });
  });

  ws.on('close', () => {
    broadcasters.delete(ws);
    console.log('Broadcaster disconnected');
  });

})

app.ws('/receive', function(ws, req) {
  receivers.add(ws);
  console.log('A new receiver connected.');
  receiver.send("Hello");

  ws.on('close', () => {
    receivers.delete(ws);
    console.log('Receiver disconnected');
  });
});



server.listen(3344)