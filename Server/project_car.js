const express = require('express'); 
const path = require('path');
const http = require('http');
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const db = pgp('postgres://postgres:123456@localhost:5432/project_car');
const moment = require('moment-timezone');
const { Server } = require('socket.io');
const net = require('net');
const axios = require('axios');
const port = 4000;
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());

// API routes
app.post('/data', (req, res) => {
  const { carin, carout, time } = req.body; // เพิ่ม time ในการรับข้อมูล
  if (carin === 0 && carout === 0) {
    return res.status(200).json({ message: "Both values are zero. Data will not be stored." });
  }
  // แปลงเวลาจากข้อความให้เป็นวัตถุ Date
  const timeDate = new Date(time);
  const total = carin - carout;
  const query = "INSERT INTO project (time, carin, carout, total) VALUES ($1, $2, $3, $4)"; // ไม่ได้ใช้ localtimestamp แล้ว
  db.none(query, [timeDate, carin, carout, total]) // เพิ่ม timeDate ใน array ของพารามิเตอร์
    .then(() => {
      console.log('Data from Arduino:', { carin, carout, time: timeDate }); // แสดงเวลาที่รับได้
      return res.status(201).json();
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: "Failed to insert data into database" });
    });
});

function sendData() {
  Promise.all([
      db.any(`
          SELECT
              date_trunc('hour', time) + INTERVAL '15 min' * floor(date_part('minute', time) / 15) AS time_interval, 
              SUM(carin) AS carin, 
              SUM(carout) AS carout
          FROM 
              project 
          GROUP BY 
              date_trunc('hour', time) + INTERVAL '15 min' * floor(date_part('minute', time) / 15) 
          ORDER BY 
              time_interval DESC;
      `),
      db.one(`
          SELECT SUM(carin - carout) AS total
          FROM project;
      `)
  ])
  .then(([data1, result]) => {
      data1.forEach((item) => {
          item.time_interval = moment.tz(item.time_interval, 'Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
      });
      const totalRemainingCars = result.total;
      io.sockets.emit('data', { data1, total: totalRemainingCars });
  })
  .catch((error) => {
      console.log(error);
  });
}

io.on('connection', async (socket) => {
  console.log('a user connected');
  await sendData();
  const interval = setInterval(sendData, 1000);
  socket.on('disconnect', () => {
    console.log('user disconnected');
    clearInterval(interval);
  });
});

// Arduino connection
let arduinoConnected = false;
let dataTimeout;

const arduinoServer = net.createServer((arduinoSocket) => {
  console.log('Arduino connected');
  arduinoConnected = true;
  notifyConnect();
  try {
    arduinoSocket.on('data', (data) => {
      console.log(data.toString());
      clearTimeout(dataTimeout);
      dataTimeout = setTimeout(() => {
        notifyDisconnect();
        arduinoConnected = false; // เรียกใช้ฟังก์ชัน notifyDisconnect เมื่อไม่ได้รับข้อมูลจาก Arduino ภายใน 5 วินาที
      }, 5000);
    });
  } catch (error) {
    console.log(error);
  }
  
});

arduinoServer.on('error', (err) => {
  console.error('Arduino server error:', err);
});

const arduinoPort = 8080;
arduinoServer.listen(arduinoPort, () => {
  console.log(`Arduino server is running on port ${arduinoPort}`);
});


function notifyConnect() {
  const LINE_NOTIFY_TOKEN2 = 'eLyGGlRMuRLs3GDKAxcqPcavhBxRIqAumYocRs1aoma'; // เปลี่ยนเป็น Token จริงที่ได้จาก Line Notify
  const message2 = 'เชื่อมต่อแล้ว';
  
  axios.post('https://notify-api.line.me/api/notify', 
    `message=${message2}`, 
    { 
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded', 
        'Authorization': `Bearer ${LINE_NOTIFY_TOKEN2}` 
      } 
    })
    .then((response) => {
      console.log('Line notification sent successfully');
    })
    .catch((error) => {
      console.error('Error sending Line notification:', error);
    });
}

// Function to notify disconnect from Arduino
function notifyDisconnect() {
    console.log('Arduino disconnected');
    const LINE_NOTIFY_TOKEN = 'eLyGGlRMuRLs3GDKAxcqPcavhBxRIqAumYocRs1aoma'; // เปลี่ยนเป็น Token จริงที่ได้จาก Line Notify
    const message = 'ตึกA หลุดการเชื่อมต่อ';
    
    axios.post('https://notify-api.line.me/api/notify', 
      `message=${message}`, 
      { 
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded', 
          'Authorization': `Bearer ${LINE_NOTIFY_TOKEN}` 
        } 
      })
      .then((response) => {
        console.log('Line notification sent successfully');
      })
      .catch((error) => {
        console.error('Error sending Line notification:', error);
      });
  };

// Serve static files from the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/frontend/public/index.html'));
});
// Open server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});