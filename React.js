const express = require('express');
const app = express();
const port = 3001;

let jsonData = {
  CarIn: 10,
  CarOut: 5
};

app.get('/data', (req, res) => {
  res.json(jsonData);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// อัปเดตค่าข้อมูลทุกๆ 1 วินาที
setInterval(() => {
  // ทำการอัปเดตค่าข้อมูลตามที่ต้องการ
  jsonData = {
    CarIn: Math.floor(Math.random() * 20), // สุ่มค่า CarIn ระหว่าง 0 ถึง 19
    CarOut: Math.floor(Math.random() * 10) // สุ่มค่า CarOut ระหว่าง 0 ถึง 9
  };
}, 1000);