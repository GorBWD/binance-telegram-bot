const Binance = require('node-binance-api');
const { encrypt, decrypt } = require('../utils');

const clients = {};

class Connections extends Array {
    push(...args) {
        const quantity = args.length;
        const length = super.push(...args);

        return () => {
            this.splice(length - quantity - 1, quantity);
        }
    }

    broadcast(msg) {
        this.forEach(connection => {
            connection.write(`event: alert\n`);
            connection.write(`data: ${msg}\n\n`);
        });
    }
}

class BinanceApi extends Binance {
    constructor(APIKEY, APISECRET) {
        super();

        this.connections = new Connections();
        this.options({ 
            APIKEY, 
            APISECRET, 
            verbose: false, 
            urls: { stream: 'wss://stream.binance.com/' }
        });
    }

    static getClient(token) {
        let apiClient = clients[token];

        if ( !apiClient ) {
            const [ api_key, api_secret ] = decrypt(token).split(':')

            apiClient = clients[token] = new BinanceApi(api_key, api_secret);
        }

        return apiClient;
    }

    static authorize(key, secret) {
        const apiClient = new this(key, secret);

        const token = encrypt(`${key}:${secret}`);
        
        clients[token] = apiClient;
            
        return token;
    }
}

module.exports = BinanceApi;
