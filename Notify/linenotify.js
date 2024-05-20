// lineNotify.js
const axios = require('axios');

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

module.exports = { notifyConnect, notifyDisconnect };