// server.js
const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); // เพิ่ม middleware สำหรับ CORS
const { Server } = require('socket.io');
const router = require('./RouterJeab/router');
const { sendDataAPI } = require('./Data/database');
const { sendDataBAPI } = require('./Data/databaseB');
const pgp = require("pg-promise")();
const db = pgp('postgres://postgres:123456@localhost:5432/project_car');
const moment = require('moment-timezone');
const { notifyConnect, notifyDisconnect } = require('./Notify/linenotify');

const { getRequestToArduino} = require('./RouterJeab/httpreq');


const app = express();
const server = http.createServer(app);

// Middleware
setInterval (getRequestToArduino, 1000);

//setInterval (getRequestToExprees, 1000);

app.use(bodyParser.json());

// React router
app.get('/', (req, res) => {
  // Send the index.html file from the React build directory
  res.sendFile(path.join(__dirname,'frontend', 'public', 'index.html'));
});

app.post('/dataB', (req, res) => {
  const { carin, carout} = req.body; // เพิ่ม time ในการรับข้อมูล
  if (carin === 0 && carout === 0) {
    return res.status(200).json({ message: "Both values are zero. Data will not be stored." });
  }
  // แปลงเวลาจากข้อความให้เป็นวัตถุ Date
  const totalB = carin - carout;
  const queryB = `INSERT INTO public."projectB" ("timeB", "carinB", "caroutB", "totalB") VALUES (localtimestamp, $1, $2, $3)`;
  return db.none(queryB, [carin, carout, totalB])
  .then(() => {
      console.log('Data received:', { carin, carout });
      return res.status(201).json();
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: "Failed to insert data into database" });
    });
});

// สร้าง API endpoint สำหรับรับข้อมูล
app.get('/api/dataA', (req, res) => {
  sendDataAPI()
      .then((data) => {
          res.json(data);
      })
      .catch((error) => {
          console.error(error);
          res.status(500).json({ error: 'Internal server error' });
      });
});
app.get('/api/dataB', (req, res) => {
  sendDataBAPI()
      .then((data) => {
          res.json(data);
      })
      .catch((error) => {
          console.error(error);
          res.status(500).json({ error: 'Internal server error' });
      });
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

