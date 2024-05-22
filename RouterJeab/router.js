const express = require('express');
const router = express.Router();
const { processData } = require('../Data/database');

router.post('/data', async (req, res) => {
  try {
    const { carin, carout } = req.body;
    
    if (carin === 0 && carout === 0) {
      return res.status(400).json({ message: "Both values are zero. Data will not be stored." });
    }

    await processData(carin, carout);

    console.log('Data received:', { carin, carout });
    return res.status(201).json();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to insert data into database" });
  }
});

module.exports = router;