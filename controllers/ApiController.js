const api = require('node-binance-api');
const Client = require('../models/Client');
const BinanceApi = require('../services/BinanceApi');
const ValidationError = require('../utils/ValidationError');

module.exports = {
    async init(req, res, next) {
        const { api_key, api_secret } = req.query;
        let result = {};

        try {
            const token = BinanceApi.authorize(api_key, api_secret);

            await Client.updateOne({
                api_key
            }, {
                api_key, api_secret, token,
                status: Client.STATUS.ENABLED
            }, {
                upsert: true
            });

            Object.assign(result, { token });
        } catch(err) {

            if ( err?.name == 'MongoError' && err.code == 11000 ) {
                return next(new ValidationError('Client Already Initalized'));
            }

            return next(err);
        }

        return res.status(201).json(result);
    },

    async destroy(req, res) {
        const { token } = req.query;
        const apiClient = BinanceApi.getClient(token);

        let endpoints = apiClient.websockets.subscriptions();

        for ( let endpoint in endpoints ) {
            apiClient.websockets.terminate(endpoint);
        }

        apiClient.connections.forEach(connection => connection.destroy());

        await Client.updateOne({ token }, { status: Client.STATUS.DISABLED });

        return res.status(204).end();
    },
    
    async getAllTradingPairs(req, res) {
        const { token } = req.query;

        const apiClient = BinanceApi.getClient(token);
        const prices = await apiClient.futuresPrices();

        return res.status(200).json(prices);
    },

    async createAlert(req, res) {
        const { token, pair, min, max } = req.body;
        const apiClient = BinanceApi.getClient(token);

        let lastCheck = Date.now();

        const wsConnection = apiClient.websockets.subscribe('stream', (data) => {
            if ( !data.data || Date.now() - lastCheck < 3000 ) {
                return;
            }

            lastCheck = Date.now();

            let {
                s : symbol, 
                p : price, 
                q : quantity, 
                m : maker
            } = data.data;

            if ( price > min && price < max ) {
                apiClient.connections.broadcast(`${symbol} trade update. price: ${price}, quantity: ${quantity}, maker: ${maker}`);
            }
        });

        wsConnection.on('open', () => {
            wsConnection.send(`{"method":"SUBSCRIBE","params":["${pair.toLowerCase()}@aggTrade"],"id":2}`);
        });

        return res.status(201).json({});
    },

    async alertPull(req, res) {
        const token = req.query.token;

        const headers = {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        };

        res.writeHead(200, headers);
        res.token = token;

        const apiClient = BinanceApi.getClient(token);
        const shiftConnection = apiClient.connections.push(res);
        
        req.on('close', () => shiftConnection());
    }
}