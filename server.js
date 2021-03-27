const express = require('express');
const cors = require('cors');
const ValidationError = require('./utils/ValidationError');
const ApiController = require('./controllers/ApiController');
const { PORT } = require('./config');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/api/init', ApiController.init);
app.delete('/api/destroy', ApiController.destroy);
app.get('/api/getAllTradingPairs', ApiController.getAllTradingPairs);
app.post('/api/createAlert', ApiController.createAlert);
app.get('/api/alertPull', ApiController.alertPull);

app.use((err, req, res, next) => {
    if ( !(err instanceof ValidationError) ) {
        console.error('Unknown error', err);
    }

    const statusCode = err?.statusCode || 500;

    return res.status(statusCode).json({
        statusCode,
        message: err.message
    });
});

app.listen(PORT, () => console.info(`Server runing on PORT: ${PORT}`))
