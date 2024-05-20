const http = require('http');

// กำหนด IP address และ port ของ Arduino
const arduinoIP = '192.168.85.67'; // เปลี่ยนเป็น IP address ของ Arduino
const arduinoPort = 80;

let isRequesting = false;

// สร้าง HTTP คำขอไปยัง Arduino
function getRequestToArduino() {

    const options = {
      hostname: arduinoIP,
      port: arduinoPort,
      path: '/',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(JSON.parse(data));
      });
    });

    req.on('error', (error) => {
      console.error(error);
    });

    req.end();
  }

setInterval (getRequestToArduino, 1000);
