// server.js (Express.js example)
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { sendData } = require('./Data/database');

app.use(bodyParser.json());

app.get('/api/data', (req, res) => {
    sendData()
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});