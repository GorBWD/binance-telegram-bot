const express = require('express');
const cors = require('cors');
const ApiController = require('./controllers/ApiController');
const { PORT } = require('./config');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/api/init', ApiController.init);
app.get('/api/getAllTradingPairs', ApiController.getAllTradingPairs);
app.get('/api/createAlert', ApiController.createAlert);
app.get('/api/alertPull', ApiController.alertPull);

app.listen(PORT, () => console.info(`Server runing on PORT: ${PORT}`))
