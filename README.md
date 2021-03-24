# Telegram Binance Bot
#### _this bot alerts on binance trade change_

### Quick Start
1. Create Telegram Bot Application using `BotFather` bot on telegram providing name and etc...
2. Copy HTTP API token from `BotFather` to application `BOT_TOKEN` environment variable

```
npm install
npm start
```

### Telegram Bot 
> Initialize Binance Api Client
```
/init {{binance-key}} {{binance-secret}}

Reply message: {{token}}
```

> Destroy Binance Api Client (`Not implemented yet`)
```
/destroy {{token}}

Reply message: destroid
```


> Get All Trading pairs in CSV
```
/getAllTradingPairs {{token}}

Reply message: binance api result on CSV format
```

> Create Alert for trade pair limit change
```
/createAlert {{token}} {{pair}} {{pair price min}} {{pair price max}}

Reply message: Alert succesfully created!
Additional 
```

> Pull reached alerts
```
/alertPull {{token}}

Reply message: on pair price changes reaches limit of 
```
