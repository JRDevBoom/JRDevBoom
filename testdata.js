const axios = require('axios');

// กำหนด URL ของเซิร์ฟเวอร์ Express ของคุณพร้อมกับพอร์ตที่ใช้
const serverURL = 'http://192.168.85.84:5555';

// สร้างฟังก์ชั่นสำหรับรับค่า CarIn และ CarOut
async function fetchData() {
  try {
    const response = await axios.get(`${serverURL}/dataB`); // ส่งคำขอ GET ไปยังเซิร์ฟเวอร์ของคุณ
    const data = response.data; // รับข้อมูลที่เซิร์ฟเวอร์ส่งกลับมา
    console.log('CarIn:', data.CarIn, 'CarOut:', data.CarOut); // แสดงค่า CarIn และ CarOut ที่ได้รับ
  } catch (error) {
    console.error('Error fetching data:', error.message); // แสดงข้อผิดพลาดหากเกิดข้อผิดพลาดในการรับข้อมูล
  }
}

// เรียกใช้งานฟังก์ชั่น fetchData() เพื่อรับค่า CarIn และ CarOut ทุกๆ 5 วินาที
setInterval(fetchData, 1000);