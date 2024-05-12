const express = require('express');
const expressWS = require('express-ws');

console.log("Starting server");

const app = express();
expressWS(app);

const broadcasters = new Set();
const receivers = new Set();

app.ws('/broadcast', function(ws, req) {
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
});

app.ws('/receive', function(ws, req) {
  receivers.add(ws);
  console.log('A new receiver connected.');

  ws.on('close', () => {
    receivers.delete(ws);
    console.log('Receiver disconnected');
  });
});

const port = 3344;
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});