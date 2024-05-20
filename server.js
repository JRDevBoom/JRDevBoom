// server.js
const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); // เพิ่ม middleware สำหรับ CORS
const { Server } = require('socket.io');
const router = require('./RouterJeab/router');
const { sendData } = require('./Data/database');
const { notifyConnect, notifyDisconnect } = require('./Notify/linenotify');
const log4js = require('log4js');
const logger = log4js.getLogger(); // นำเข้า logger จาก log4js

const { getRequestToArduino } = require('./RouterJeab/httpreq');


const app = express();
const server = http.createServer(app);
const io = new Server(server);



// Function to handle Socket.IO connection
const handleSocketConnection = async (socket) => {
  console.log('A user connected');
  await sendData(io);
  const interval = setInterval(() => sendData(io), 1000);
  socket.on('disconnect', () => {
    console.log('User disconnected');
    clearInterval(interval);
  });
};

// Middleware
setInterval (getRequestToArduino, 10000);

// Socket.IO connection
io.on('connection', handleSocketConnection);

// เปลี่ยนเส้นทางไปยังไดเรกทอรีของ React ในเครื่องอื่น
app.use(express.static(path.join(__dirname, 'frontend')));

// React router
app.get('/', (req, res) => {
  // Send the index.html file from the React build directory
  res.sendFile(path.join(__dirname,'frontend', 'public', 'index.html'));
});
// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


// arduinoServer.js
const net = require('net');

let arduinoConnected = false;
let dataTimeout;

// Function to handle Arduino connection
const handleArduinoConnection = (arduinoSocket) => {
  console.log('Arduino connected');
  arduinoConnected = true;
  notifyConnect();
try {
  // Listen for data from Arduino
  arduinoSocket.on('data', (data) => {
    console.log(data.toString());
    clearTimeout(dataTimeout);
    dataTimeout = setTimeout(() => {
      notifyDisconnect();
    }, 5000);
  });
  
} catch (error) {
  console.log(error);

}
  arduinoSocket.on('error', (error) => {
    console.error('Arduino socket error:', error);
  });
};

// Create Arduino server
const arduinoServer = net.createServer(handleArduinoConnection);
const arduinoPort = 8080;

arduinoServer.on('error', (error) => {
  console.error('Arduino server error:', error);
});

arduinoServer.listen(arduinoPort, () => {
  console.log(`Arduino server is running on port ${arduinoPort}`);
});