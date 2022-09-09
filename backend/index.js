const express = require('express');
const app = express();
require('dotenv').config();
const registerrouter = require('./route/register');
// const carrouter = require('./route/car');
const { createCar, queryAllCar, deliverCar, sellCar, trackCar } = require('./controller/car');

const port = process.env.port || 4000;

app.use(express.json());

app.use('/api/users', registerrouter);

app.post('/api/v1/createCar', createCar);
app.get('/api/v1/getAllCar', queryAllCar);
app.post('/api/v1/deliverCar', deliverCar);
app.post('/api/v1/sellCar', sellCar);
app.post('/api/v1/trackCar', trackCar);

// Connect to the port
const server = app.listen(port, () => console.log(`Server running on port: ${port}`));

// Handle unhandled promise rejections
process.on('unhandledRejection',(err,promise) => {
    console.log(`Error: ${err.message}`);
    // Closer server & exit process
    server.close(() => process.exit(1));
});