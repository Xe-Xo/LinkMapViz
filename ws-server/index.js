const express = require('express');

const fs = require('fs');
const https = require('https');
const WebSocketServer = require('ws').Server;


console.log("Starting server");

const cts = {
  cert: fs.readFileSync("/etc/letsencrypt/live/arcade-numeric.bnr.la/fullchain.pem"),
  key: fs.readFileSync("/etc/letsencrypt/live/arcade-numeric.bnr.la/privkey.pem")
}



console.log("Certificates loaded");

const app = express();
const server = https.createServer(cts)
//expressWS(app, server);

const wss = new WebSocketServer({ server });


const broadcasters = new Set();
const receivers = new Set();


wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(msg) {
    console.log(msg.toString());
  });
});

server.listen(function listening() {
  //
  // If the `rejectUnauthorized` option is not `false`, the server certificate
  // is verified against a list of well-known CAs. An 'error' event is emitted
  // if verification fails.
  //
  // The certificate used in this example is self-signed so `rejectUnauthorized`
  // is set to `false`.
  //
  const ws = new WebSocket(`wss://localhost:${server.address().port}`, {
    rejectUnauthorized: false
  });

  ws.on('error', console.error);

  ws.on('open', function open() {
    ws.send('All glory to WebSockets!');
  });
});

// app.ws('/broadcast', function(ws, req) {
//   broadcasters.add(ws);
//   console.log('A new broadcaster connected.');

//   ws.on('message', function(message) {
//     console.log('Broadcasting: %s', message);
//     receivers.forEach(receiver => {
//       //if (receiver.readyState === WebSocket.OPEN) {
//       receiver.send(message);
//       //}
//     });
//   });

//   ws.on('close', () => {
//     broadcasters.delete(ws);
//     console.log('Broadcaster disconnected');
//   });
// });

// app.ws('/receive', function(ws, req) {
//   receivers.add(ws);
//   console.log('A new receiver connected.');

//   ws.on('close', () => {
//     receivers.delete(ws);
//     console.log('Receiver disconnected');
//   });
// });

// const port = 3344;
// app.listen(port, () => {
//     console.log(`Server started on http://localhost:${port}`);
// });