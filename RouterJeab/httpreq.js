const http = require('http');
const express = require('express');
const app = express();
const { processData, processDataB } = require('../Data/database');

// กำหนด IP address และ port ของ Arduino


// สร้าง HTTP คำขอไปยัง Arduino
function getRequestToArduino() {

  const arduinoIP = '192.168.85.67'; // เปลี่ยนเป็น IP address ของ Arduino
  const arduinoPort = 80;

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
        try {
          const jsonData = JSON.parse(data);
          const { carin, carout } = jsonData; // สมมติว่า JSON ที่ได้มีคีย์ carin และ carou
          if (carin === 0 && carout === 0) {
            return;
          }
          processData(carin, carout);
          console.log('Data received:', { carin, carout });
      } catch (error) {
          console.error('Error parsing JSON:', error);
      }
      });
    });

    req.on('error', (error) => {
    });
    req.end();
  }



  

module.exports = { getRequestToArduino };