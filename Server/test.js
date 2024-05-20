const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('Connected')
})

app.get('/', (req, res) => {
    console.log('hello')
    res.send('hello im node.js')
  });

app.listen(5000, () => {
    console.log('Server is running on port 5000');
  });